"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

/**
 * Page管理用の型定義
 */
interface Page {
  id: string;
  number: number;
  blocks: any[];
}

/**
 * useWriterEditor - 文書作成専用フック
 * 文書の作成・編集・AI連携・ページ管理・保存に必要な機能を提供
 */
export const useWriterEditor = () => {
  // ページ管理
  const [pages, setPages] = useState<Page[]>([
    { id: nanoid(), number: 1, blocks: [] },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [blocks, setBlocks] = useState<any[]>([]);

  // 選択状態
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // 用紙サイズ（テンプレートから読み込む）
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");

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
    };

    let block: any = {};

    switch (type) {
      case "text":
        block = {
          ...base,
          label: "テキスト",
          fontSize: 16,
          fontFamily: "sans-serif",
          textAlign: "left",
          color: "#000000",
          editable: true,
        };
        break;
      case "table":
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
          editable: false,
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

    setBlocks((prev) => [...prev, block]);
    setSelectedBlock(block);
  };

  // HTMLテーブルからテーブルブロックを追加
  const addTableBlock = (cells: any[][], x: number = 100, y: number = 100) => {
    const rows = cells.length;
    const cols = cells[0]?.length || 0;

    if (rows === 0 || cols === 0) {
      return null;
    }

    const block: any = {
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
      cells: cells,
    };

    setBlocks((prev) => [...prev, block]);
    setSelectedBlock(block);
    return block;
  };

  const updateBlock = (id: string, updated: any) => {
    // 現在のページのブロックを更新
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );

    // タイトルプレースホルダーの場合、全ページの同じタイトルを同期
    // ただし、編集中（isEditing: true）の場合は同期しない（カーソル位置保持のため）
    const targetBlock = blocks.find((b) => b.id === id);
    if (
      targetBlock && 
      targetBlock.type === "titlePlaceholder" && 
      updated.value !== undefined &&
      updated.isEditing === false // 編集終了時のみ全ページ同期
    ) {
      setPages((prev) =>
        prev.map((page) => ({
          ...page,
          blocks: page.blocks.map((b) =>
            b.type === "titlePlaceholder" ? { ...b, value: updated.value } : b
          ),
        }))
      );
    }

    // 選択中のブロック情報も同期
    if (selectedBlock?.id === id) {
      setSelectedBlock((prev: any) => ({ ...prev, ...updated }));
    }
  };

  const selectBlock = (id: string | null) => {
    if (id === null) {
      setSelectedBlock(null);
      setSelectedCell(null);
      return;
    }
    const block = blocks.find((b) => b.id === id);
    if (block) setSelectedBlock(block);
    // 異なるブロックに切り替わる場合のみセルをリセット
    if (selectedBlock?.id !== id) {
      setSelectedCell(null);
    }
  };

  const deleteBlock = (id: string) => {
    const targetBlock = blocks.find((b) => b.id === id);
    
    // 削除禁止条件
    if (targetBlock) {
      // 1. タイトルプレースホルダーは削除不可
      if (targetBlock.type === "titlePlaceholder") {
        alert("タイトルブロックは削除できません。");
        return;
      }
      
      // 2. 編集中のブロックは削除不可
      if (targetBlock.isEditing === true) {
        alert("編集中のブロックは削除できません。編集を終了してから削除してください。");
        return;
      }
    }
    
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    // 削除されたブロックが選択中だったら選択を解除
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
      setSelectedCell(null);
    }
  };

  // ブロックを一括設定
  const setAllBlocks = (newBlocks: any[]) => {
    setBlocks(newBlocks);
    setSelectedBlock(null);
    setSelectedCell(null);
  };

  // ページ管理機能
  const addPage = () => {
    const newPageNumber = pages.length + 1;
    
    // 1ページ目のテンプレートブロック（通常のテキストブロック以外）をコピー
    const firstPage = pages[0];
    const templateBlocks = firstPage?.blocks
      ? JSON.parse(JSON.stringify(firstPage.blocks)).filter((block: any) => {
          // 通常のテキストブロックは除外、titlePlaceholder（タイトル）は含める
          return block.type !== "text";
        })
      : [];
    
    const newPage: Page = {
      id: nanoid(),
      number: newPageNumber,
      blocks: templateBlocks, // テンプレートとタイトルを引き継ぐ
    };
    setPages((prev) => [...prev, newPage]);
    return newPageNumber;
  };

  const deletePage = (pageNumber: number) => {
    // 1ページ目は削除できない
    if (pageNumber === 1 || pages.length === 1) {
      return false;
    }

    // 現在のページのブロックを保存
    setPages((prev) =>
      prev.map((p) =>
        p.number === currentPage ? { ...p, blocks: [...blocks] } : p
      )
    );

    // ページを削除し、番号を振り直す
    setPages((prev) => {
      const filtered = prev.filter((p) => p.number !== pageNumber);
      return filtered.map((p, index) => ({
        ...p,
        number: index + 1,
      }));
    });

    // 削除したページが現在ページの場合、前のページに移動
    if (currentPage === pageNumber) {
      const newCurrentPage = Math.max(1, pageNumber - 1);
      setTimeout(() => {
        switchPage(newCurrentPage);
      }, 0);
    } else if (currentPage > pageNumber) {
      // 削除したページより後ろにいる場合、番号を調整
      setCurrentPage((prev) => prev - 1);
    }

    return true;
  };

  const switchPage = (pageNumber: number) => {
    // 現在のページのブロックを保存
    setPages((prev) =>
      prev.map((p) =>
        p.number === currentPage ? { ...p, blocks: [...blocks] } : p
      )
    );

    // 新しいページのブロックを読み込み
    const targetPage = pages.find((p) => p.number === pageNumber);
    if (targetPage) {
      setCurrentPage(pageNumber);
      setBlocks([...targetPage.blocks]);
      setSelectedBlock(null);
      setSelectedCell(null);
      return targetPage.blocks;
    }
    return null;
  };

  const updateCurrentPageBlocks = (newBlocks: any[]) => {
    setPages((prev) =>
      prev.map((p) =>
        p.number === currentPage ? { ...p, blocks: [...newBlocks] } : p
      )
    );
  };

  const resetToSinglePage = () => {
    setPages([{ id: nanoid(), number: 1, blocks: [] }]);
    setCurrentPage(1);
    setBlocks([]);
    setSelectedBlock(null);
    setSelectedCell(null);
  };

  const loadPages = (loadedPages: Page[]) => {
    if (loadedPages && loadedPages.length > 0) {
      setPages(loadedPages);
      setCurrentPage(1);
      setBlocks([...loadedPages[0].blocks]);
      setSelectedBlock(null);
      setSelectedCell(null);
      return loadedPages[0].blocks;
    }
    return [];
  };

  // テンプレート読み込み（読み込みのみ）
  const loadTemplate = useCallback((templateId: string) => {
    if (typeof window === "undefined") return;
    
    const templates = JSON.parse(localStorage.getItem("templates") || "[]");
    const template = templates.find((t: any) => t.id === templateId);
    
    console.log("Loading template:", template);
    
    if (template) {
      // 用紙サイズと向きを読み込む
      const templatePaper = template.paper || "A4";
      const templateOrientation = template.orientation || "portrait";
      
      console.log("Template paper:", templatePaper, "orientation:", templateOrientation);
      
      setPaper(templatePaper);
      setOrientation(templateOrientation);
      
      // テンプレートのブロックをディープコピーして、グリッドに揃える
      const gridSize = 20; // 固定グリッドサイズ
      const templateBlocks = JSON.parse(JSON.stringify(template.blocks)).map((b: any) => ({
        ...b,
        x: Math.round(b.x / gridSize) * gridSize,
        y: Math.round(b.y / gridSize) * gridSize,
        width: Math.round(b.width / gridSize) * gridSize,
        height: Math.round(b.height / gridSize) * gridSize,
      }));
      
      setBlocks(templateBlocks);
      setSelectedBlock(null);
      setSelectedCell(null);
      
      // 単一ページにリセット
      setPages([{ id: nanoid(), number: 1, blocks: templateBlocks }]);
      setCurrentPage(1);
    }
  }, []);

  // 文書保存
  const saveDocument = (title: string, status: "draft" | "submitted" = "draft") => {
    const document = {
      id: nanoid(),
      title,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: JSON.parse(JSON.stringify(pages)), // ディープコピー
    };

    const existing = JSON.parse(localStorage.getItem("documents") || "[]");
    const updated = [...existing, document];
    localStorage.setItem("documents", JSON.stringify(updated));

    return document;
  };

  // 下書き保存
  const saveDraft = (title: string) => {
    return saveDocument(title, "draft");
  };

  // 文書提出
  const submitDocument = (title: string) => {
    return saveDocument(title, "submitted");
  };

  // 下書き読み込み
  const loadDraft = (draft: any) => {
    if (draft.pages) {
      const blocks = loadPages(draft.pages);
      return blocks;
    } else {
      resetToSinglePage();
      setBlocks(draft.blocks || []);
      return draft.blocks || [];
    }
  };

  return {
    // ブロック管理
    blocks,
    addBlock,
    addTableBlock,
    updateBlock,
    selectedBlock,
    selectBlock,
    deleteBlock,
    selectedCell,
    setSelectedCell,
    setAllBlocks,

    // ページ管理
    pages,
    currentPage,
    addPage,
    deletePage,
    switchPage,
    updateCurrentPageBlocks,
    resetToSinglePage,
    loadPages,

    // テンプレート読み込み（読み込みのみ）
    loadTemplate,

    // 文書保存
    saveDocument,
    saveDraft,
    submitDocument,
    loadDraft,

    // 用紙サイズ
    paper,
    orientation,
  };
};
