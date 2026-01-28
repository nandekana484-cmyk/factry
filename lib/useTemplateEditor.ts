"use client";

import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";

/**
 * useTemplateEditor - テンプレート編集専用フック（DB対応版）
 * テンプレートの作成・編集・保存に必要な機能を提供
 * 
 * ⚠️ LocalStorageからDBに移行しました
 * - 初回ロード時にLocalStorageのデータをDBに移行
 * - 以降はAPI経由でCRUD
 */
export const useTemplateEditor = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1000);
  const [hasMigrated, setHasMigrated] = useState(false);

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

  // 初回マウント時にLocalStorageからDBへ移行
  useEffect(() => {
    if (hasMigrated) return;
    
    const migrateFromLocalStorage = async () => {
      try {
        const localTemplates = localStorage.getItem("templates");
        if (!localTemplates) {
          setHasMigrated(true);
          return;
        }

        const templates = JSON.parse(localTemplates);
        if (templates.length === 0) {
          setHasMigrated(true);
          return;
        }

        console.log(`LocalStorageから${templates.length}件のテンプレートをDBに移行します...`);

        for (const template of templates) {
          try {
            const response = await fetch("/api/templates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: template.name,
                content: {
                  blocks: template.blocks,
                  paper: template.paper || "A4",
                  orientation: template.orientation || "portrait",
                },
              }),
            });

            if (!response.ok) {
              console.error(`テンプレート "${template.name}" の移行に失敗:`, await response.text());
            }
          } catch (error) {
            console.error(`テンプレート "${template.name}" の移行エラー:`, error);
          }
        }

        // 移行完了後、LocalStorageをクリア
        localStorage.removeItem("templates");
        console.log("テンプレートの移行が完了しました");
        setHasMigrated(true);
      } catch (error) {
        console.error("テンプレート移行エラー:", error);
        setHasMigrated(true);
      }
    };

    migrateFromLocalStorage();
  }, [hasMigrated]);

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
          src: "",
          borderColor: "#cccccc",
          borderWidth: 1,
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

  // 画像ブロックを追加（Base64データ付き）
  const addImageBlock = (imageData: string, x: number = 100, y: number = 100) => {
    const block: any = {
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
      editable: false,
    };

    setBlocks((prev) => [...prev, block]);
    setSelectedBlock(block);
    return block;
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
      editable: false,
      cells: cells,
    };

    setBlocks((prev) => [...prev, block]);
    setSelectedBlock(block);
    return block;
  };

  const updateBlock = (id: string, updated: any) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...updated } : b));
    setBlocks(newBlocks);

    // 選択中のブロック情報も同期
    if (selectedBlock?.id === id) {
      setSelectedBlock((prev: any) => ({ ...prev, ...updated }));
    }

    // 履歴に保存
    saveToHistory();
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
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    
    // 削除されたブロックが選択中だったら選択を解除
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
      setSelectedCell(null);
    }

    // 履歴に保存
    saveToHistory();
  };

  const saveTemplate = async (name: string) => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          content: {
            blocks: JSON.parse(JSON.stringify(blocks)),
            paper,
            orientation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      const data = await response.json();
      setSelectedTemplateId(data.template.id);
      return data.template;
    } catch (error) {
      console.error("Save template error:", error);
      throw error;
    }
  };

  // テンプレート上書き保存（API経由）
  const saveTemplateOverwrite = async () => {
    if (!selectedTemplateId) return null;

    try {
      const response = await fetch(`/api/templates/${selectedTemplateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            blocks: JSON.parse(JSON.stringify(blocks)),
            paper,
            orientation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      const data = await response.json();
      return data.template;
    } catch (error) {
      console.error("Update template error:", error);
      throw error;
    }
  };

  // 名前を変更して新規保存（API経由）
  const saveTemplateAsNew = async (newName: string) => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          content: {
            blocks: JSON.parse(JSON.stringify(blocks)),
            paper,
            orientation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template as new");
      }

      const data = await response.json();
      setSelectedTemplateId(data.template.id);
      return data.template;
    } catch (error) {
      console.error("Save template as new error:", error);
      throw error;
    }
  };

  // テンプレートをローカルストレージから読み込む（API経由）
  const loadTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      const template = data.templates.find((t: any) => t.id === templateId);
      
      if (template && template.content) {
        // 用紙サイズと向きを読み込む
        setPaper(template.content.paper || "A4");
        setOrientation(template.content.orientation || "portrait");
        
        // 読み込み時にzIndexと位置・サイズをグリッドに揃える
        const blocksWithZIndex = (template.content.blocks || []).map((b: any) => {
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
        setSelectedTemplateId(templateId);
      }
    } catch (error) {
      console.error("Load template error:", error);
    }
  }, [gridSize]);

  // テンプレート削除（API経由）
  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // 削除したテンプレートが選択中だった場合はクリア
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
        setBlocks([]);
      }

      return true;
    } catch (error) {
      console.error("Delete template error:", error);
      throw error;
    }
  };

  // 新規テンプレート作成（リセット）
  const newTemplate = () => {
    setBlocks([]);
    setSelectedBlock(null);
    setSelectedCell(null);
    setSelectedTemplateId(null);
    setPaper("A4");
    setOrientation("portrait");
    setHistory([[]]);
    setHistoryIndex(0);
  };

  return {
    // ブロック管理
    blocks,
    addBlock,
    addTableBlock,
    addImageBlock,
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
