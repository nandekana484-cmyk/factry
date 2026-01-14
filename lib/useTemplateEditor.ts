"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

/**
 * useTemplateEditor - テンプレート編集専用フック
 * テンプレートの作成・編集・保存に必要な機能を提供
 */
export const useTemplateEditor = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1000);

  // UI状態管理
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [gridSize, setGridSize] = useState(20);
  const [snapMode, setSnapMode] = useState(true);

  // Undo/Redo用の履歴管理
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);

  // 履歴に現在の状態を保存
  const saveToHistory = useCallback(() => {
    if (isUndoRedoing) return;

    const currentState = JSON.parse(JSON.stringify(blocks));
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex > 50 ? 50 : newIndex;
    });
  }, [blocks, historyIndex, isUndoRedoing]);

  // Undo（元に戻す）
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    setIsUndoRedoing(true);
    const previousState = history[historyIndex - 1];
    setBlocks(JSON.parse(JSON.stringify(previousState)));
    setHistoryIndex(historyIndex - 1);
    setSelectedBlock(null);
    
    setTimeout(() => setIsUndoRedoing(false), 0);
  }, [history, historyIndex]);

  // Redo（やり直し）
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    setIsUndoRedoing(true);
    const nextState = history[historyIndex + 1];
    setBlocks(JSON.parse(JSON.stringify(nextState)));
    setHistoryIndex(historyIndex + 1);
    setSelectedBlock(null);
    
    setTimeout(() => setIsUndoRedoing(false), 0);
  }, [history, historyIndex]);

  // グリッドスナップ関数
  const snapToGrid = (value: number): number => {
    if (!snapMode) return Math.round(value);
    return Math.round(value / gridSize) * gridSize;
  };

  const addBlock = (type: string, role?: string) => {
    // 初期z-indexを決定（テキスト系は高く、図形系は低く）
    const isTextLike = type === "text" || type === "titlePlaceholder" || type === "subtitlePlaceholder";
    const isPlaceholder = role === "approval" || role === "management";
    const initialZIndex = isTextLike || isPlaceholder ? 1500 : 100;

    const base = {
      id: nanoid(),
      type,
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      isEditing: false,
      rotate: 0,
      zIndex: initialZIndex,
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
      case "line":
        block = {
          ...base,
          width: 200,
          height: 2,
          borderColor: "#000000",
          borderWidth: 2,
          editable: false,
        };
        break;
      case "rect":
        block = {
          ...base,
          borderColor: "#000000",
          borderWidth: 2,
          backgroundColor: "transparent",
          editable: false,
        };
        break;
      case "circle":
        block = {
          ...base,
          borderColor: "#000000",
          borderWidth: 2,
          backgroundColor: "transparent",
          editable: false,
        };
        break;
      case "triangle":
        block = {
          ...base,
          borderColor: "#000000",
          borderWidth: 2,
          editable: false,
        };
        break;
      case "arrow":
        block = {
          ...base,
          borderColor: "#000000",
          borderWidth: 4,
          arrowSize: 10,
          editable: false,
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
      case "image":
        block = {
          ...base,
          imageUrl: "",
          editable: false,
        };
        break;
      case "approvalStampPlaceholder":
        block = {
          ...base,
          width: 120,
          height: 120,
          role: role || "approver",
          stampImage: "",
          name: "",
          date: "",
          borderColor: "#999999",
          borderWidth: 2,
          backgroundColor: "transparent",
          editable: false,
        };
        break;
      case "managementNumberPlaceholder":
        block = {
          ...base,
          width: 200,
          height: 40,
          borderColor: "#666666",
          borderWidth: 1,
          backgroundColor: "transparent",
          editable: false,
        };
        break;
      case "titlePlaceholder":
        block = {
          ...base,
          width: 400,
          height: 50,
          value: "",
          fontSize: 20,
          fontWeight: "bold",
          fontFamily: "sans-serif",
          textAlign: "left",
          color: "#000000",
          borderColor: "#666666",
          borderWidth: 1,
          backgroundColor: "transparent",
          editable: true,
        };
        break;
      case "subtitlePlaceholder":
        block = {
          ...base,
          width: 400,
          height: 40,
          value: "",
          fontSize: 16,
          fontWeight: "normal",
          fontFamily: "sans-serif",
          textAlign: "left",
          color: "#000000",
          borderColor: "#666666",
          borderWidth: 1,
          backgroundColor: "transparent",
          editable: true,
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
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );

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
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    // 削除されたブロックが選択中だったら選択を解除
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
      setSelectedCell(null);
    }
    // 履歴に保存
    if (!isUndoRedoing) {
      setTimeout(() => saveToHistory(), 0);
    }
  };

  // テンプレート保存
  const saveTemplate = (name: string) => {
    const template = {
      id: nanoid(),
      name,
      createdAt: Date.now(),
      blocks: JSON.parse(JSON.stringify(blocks)), // ディープコピー
      paper,
      orientation,
    };

    const existing = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = [...existing, template];
    localStorage.setItem("templates", JSON.stringify(updated));

    setSelectedTemplateId(template.id); // 新規保存後に選択状態にする
    return template;
  };

  // テンプレート上書き保存（同じ名前のまま更新）
  const saveTemplateOverwrite = () => {
    if (!selectedTemplateId) return null;

    const existing = JSON.parse(localStorage.getItem("templates") || "[]");
    const currentTemplate = existing.find((t: any) => t.id === selectedTemplateId);
    if (!currentTemplate) return null;

    const updated = existing.map((t: any) =>
      t.id === selectedTemplateId
        ? {
            ...t,
            blocks: JSON.parse(JSON.stringify(blocks)),            paper,
            orientation,            updatedAt: Date.now(),
          }
        : t
    );
    localStorage.setItem("templates", JSON.stringify(updated));

    return updated.find((t: any) => t.id === selectedTemplateId);
  };

  // 名前を変更して新規保存
  const saveTemplateAsNew = (newName: string) => {
    const template = {
      id: nanoid(),
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: JSON.parse(JSON.stringify(blocks)),
      paper,
      orientation,
    };

    const existing = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = [...existing, template];
    localStorage.setItem("templates", JSON.stringify(updated));

    setSelectedTemplateId(template.id);
    return template;
  };

  // 新規作成（テンプレート選択を解除）
  const newTemplate = useCallback(() => {
    setBlocks([]);
    setSelectedBlock(null);
    setSelectedCell(null);
    setSelectedTemplateId(null);
  }, []);

  // テンプレート一覧を取得
  const getTemplates = () => {
    if (typeof window === "undefined") return [];
    const templates = JSON.parse(localStorage.getItem("templates") || "[]");
    return templates;
  };

  // テンプレートから読み込む
  const loadTemplate = useCallback((templateId: string) => {
    const templates = getTemplates();
    const template = templates.find((t: any) => t.id === templateId);
    if (template) {
      // 用紙サイズと向きを読み込む
      setPaper(template.paper || "A4");
      setOrientation(template.orientation || "portrait");
      
      // 読み込み時にzIndexと位置・サイズをグリッドに揃える
      const blocksWithZIndex = template.blocks.map((b: any) => {
        const isTextLike = b.type === "text" || b.type === "titlePlaceholder" || b.type === "subtitlePlaceholder";
        const isPlaceholder = b.role === "approval" || b.role === "management";
        
        // グリッドスナップ（snapMode無視、常にグリッドに揃える）
        const snappedX = Math.round(b.x / gridSize) * gridSize;
        const snappedY = Math.round(b.y / gridSize) * gridSize;
        const snappedWidth = Math.round(b.width / gridSize) * gridSize;
        const snappedHeight = Math.round(b.height / gridSize) * gridSize;
        
        return {
          ...b,
          x: snappedX,
          y: snappedY,
          width: snappedWidth,
          height: snappedHeight,
          zIndex: b.zIndex || (isTextLike || isPlaceholder ? 1500 : 100),
        };
      });
      setBlocks(JSON.parse(JSON.stringify(blocksWithZIndex)));
      setSelectedBlock(null);
      setSelectedCell(null);
      setSelectedTemplateId(templateId); // 選択中のテンプレートIDをセット
    }
  }, [gridSize]);

  // テンプレート削除
  const deleteTemplate = (templateId: string) => {
    const existing = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = existing.filter((t: any) => t.id !== templateId);
    localStorage.setItem("templates", JSON.stringify(updated));
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

    // テンプレート管理
    saveTemplate,
    saveTemplateOverwrite,
    saveTemplateAsNew,
    loadTemplate,
    deleteTemplate,
    selectedTemplateId,
    newTemplate,

    // UI状態管理
    paper,
    setPaper,
    orientation,
    setOrientation,
    showGrid,
    setShowGrid,
    zoom,
    setZoom,
    gridSize,
    setGridSize,
    snapMode,
    setSnapMode,

    // Undo/Redo
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
