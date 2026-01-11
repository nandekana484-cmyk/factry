"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

export const useEditor = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const addBlock = (type: string, role?: string) => {
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
          width: 240, // 初期サイズ調整
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

  const selectBlock = (id: string) => {
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
  };

  // テンプレート保存
  const saveTemplate = (name: string) => {
    const template = {
      id: nanoid(),
      name,
      createdAt: Date.now(),
      blocks: JSON.parse(JSON.stringify(blocks)), // ディープコピー
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
            blocks: JSON.parse(JSON.stringify(blocks)),
            updatedAt: Date.now(),
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
      setBlocks(JSON.parse(JSON.stringify(template.blocks)));
      setSelectedBlock(null);
      setSelectedCell(null);
      setSelectedTemplateId(templateId); // 選択中のテンプレートIDをセット
    }
  }, []);

  // テンプレート削除
  const deleteTemplate = (templateId: string) => {
    const existing = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = existing.filter((t: any) => t.id !== templateId);
    localStorage.setItem("templates", JSON.stringify(updated));
  };

  return {
    blocks,
    addBlock,
    addTableBlock,
    updateBlock,
    selectedBlock,
    selectBlock,
    deleteBlock,
    selectedCell,
    setSelectedCell,
    saveTemplate,
    saveTemplateOverwrite,
    saveTemplateAsNew,
    loadTemplate,
    deleteTemplate,
    selectedTemplateId,
    newTemplate,
    setAllBlocks: (newBlocks: any[]) => {
      setBlocks(newBlocks);
      setSelectedBlock(null);
      setSelectedCell(null);
    },
  };
};