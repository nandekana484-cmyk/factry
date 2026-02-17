import { nanoid } from "nanoid";
import type { Block } from "./types";

export function useBlockActions(state: any) {
  const { blocks, setBlocks, setSelectedBlock, setSelectedCell } = state;

  // ブロック追加
  const addBlock = (type: string) => {
    const base = {
      id: nanoid(),
      type,
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      isEditing: false,
      rotate: 0,
      locked: false,
      editable: true,
      source: "template" as const,
    };
    let block: Block = { ...base };
    switch (type) {
      case "text":
        block = { ...base, label: "テキスト", fontSize: 16, fontFamily: "sans-serif", textAlign: "left", color: "#000000" };
        break;
      case "rect":
        block = { ...base, width: 200, height: 100, fillColor: "transparent", borderColor: "#000000", borderWidth: 2 };
        break;
      case "circle":
        block = { ...base, width: 100, height: 100, fillColor: "transparent", borderColor: "#000000", borderWidth: 2 };
        break;
      case "triangle":
        block = { ...base, width: 100, height: 100, fillColor: "transparent", borderColor: "#000000", borderWidth: 2 };
        break;
      case "arrow":
        block = { ...base, width: 150, height: 50, fillColor: "transparent", borderColor: "#000000", borderWidth: 2 };
        break;
      case "line":
        block = { ...base, width: 200, height: 2, borderColor: "#000000", borderWidth: 2 };
        break;
      case "image":
        block = { ...base, width: 200, height: 150, src: "", borderColor: "#cccccc", borderWidth: 1 };
        break;
      case "table": {
        const rows = 3;
        const cols = 3;
        block = {
          ...base,
          width: 240,
          height: 90,
          rows,
          cols,
          borderColor: "#000000",
          borderWidth: 1,
          cells: Array.from({ length: rows }).map(() =>
            Array.from({ length: cols }).map(() => ({
              text: "",
              fontSize: 12,
              fontWeight: "normal",
              color: "#000000",
              width: 80,
              height: 30,
            }))
          ),
        };
        break;
      }
      default:
        block = { ...base, fillColor: "transparent", borderColor: "#000000", borderWidth: 2 };
        break;
    }
    const newBlocks = [...blocks, block];
    setBlocks(newBlocks);
    setSelectedBlock(block);
    if (typeof updateCurrentPageBlocks === 'function') {
      updateCurrentPageBlocks(newBlocks);
    }
  };

  // 画像ブロック追加
  const addImageBlock = (imageData: string, x = 100, y = 100) => {
    const block: Block = {
      id: nanoid(),
      type: "image",
      x,
      y,
      width: 200,
      height: 150,
      src: imageData,
      borderColor: "#cccccc",
      borderWidth: 1,
      isEditing: false,
      rotate: 0,
      zIndex: 100,
      editable: true,
      locked: false,
      source: "template",
    };
    const newBlocks = [...blocks, block];
    setBlocks(newBlocks);
    setSelectedBlock(block);
    if (typeof updateCurrentPageBlocks === 'function') {
      updateCurrentPageBlocks(newBlocks);
    }
    return block;
  };

  // テーブルブロック追加
  const addTableBlock = (cells: any[][], x = 100, y = 100) => {
    const rows = cells.length;
    const cols = cells[0]?.length || 0;
    if (rows === 0 || cols === 0) return null;
    const block: Block = {
      id: nanoid(),
      type: "table",
      x,
      y,
      width: Math.max(cols * 80, 240),
      height: Math.max(rows * 30, 90),
      isEditing: false,
      rotate: 0,
      rows,
      cols,
      borderColor: "#000000",
      borderWidth: 1,
      editable: true,
      locked: false,
      source: "template",
      cells,
    };
    const newBlocks = [...blocks, block];
    setBlocks(newBlocks);
    setSelectedBlock(block);
    if (typeof updateCurrentPageBlocks === 'function') {
      updateCurrentPageBlocks(newBlocks);
    }
    return block;
  };

  // ブロック更新
  const updateBlock = (id: string, updated: Partial<Block>) => {
    const targetBlock = blocks.find((b: Block) => b.id === id);
    if (!targetBlock) return;
    // タイトル系は内容編集のみ許可
    if ((targetBlock.type === "titlePlaceholder" || targetBlock.type === "subtitlePlaceholder") && updated.value !== undefined) {
      const newBlocks = blocks.map((b: Block) => b.id === id ? { ...b, value: updated.value } : b);
      setBlocks(newBlocks);
      if (typeof updateCurrentPageBlocks === 'function') {
        updateCurrentPageBlocks(newBlocks);
      }
      return;
    }
    if (!targetBlock.editable) return;
    const newBlocks = blocks.map((b: Block) => b.id === id ? { ...b, ...updated } : b);
    setBlocks(newBlocks);
    if (typeof updateCurrentPageBlocks === 'function') {
      updateCurrentPageBlocks(newBlocks);
    }
  };

  // ブロック選択
  const selectBlock = (id: string | null) => {
    if (id === null) {
      setSelectedBlock(null);
      setSelectedCell(null);
      return;
    }
    const block = blocks.find((b: Block) => b.id === id);
    if (block) {
      setSelectedBlock(block);
      setSelectedCell(null);
    }
  };

  // ブロック削除
  const deleteBlock = (id: string) => {
    const targetBlock = blocks.find((b: Block) => b.id === id);
    if (targetBlock) {
      if (targetBlock.type === "titlePlaceholder") {
        alert("タイトルブロックは削除できません。");
        return;
      }
      if (targetBlock.type === "subtitlePlaceholder") {
        alert("サブタイトルブロックは削除できません。");
        return;
      }
      if (targetBlock.isEditing === true) {
        alert("編集中のブロックは削除できません。編集を終了してから削除してください。");
        return;
      }
    }
    const newBlocks = blocks.filter((b: Block) => b.id !== id);
    setBlocks(newBlocks);
    if (typeof updateCurrentPageBlocks === 'function') {
      updateCurrentPageBlocks(newBlocks);
    }
    setSelectedBlock(null);
    setSelectedCell(null);
  };

  // ブロック一括設定
  const setAllBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    setSelectedBlock(null);
    setSelectedCell(null);
  };

  // 現在ページのブロックを更新はstateから受け取る場合のみ利用し、ここで再定義・再代入しない

  return {
    addBlock,
    addImageBlock,
    addTableBlock,
    updateBlock,
    selectBlock,
    deleteBlock,
    setAllBlocks,
  };
}

let updateCurrentPageBlocks: ((blocks: Block[]) => void) | null = null;

export function setUpdateCurrentPageBlocksCallback(callback: (blocks: Block[]) => void) {
    updateCurrentPageBlocks = callback;
}

