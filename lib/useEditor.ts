"use client";

import { useState } from "react";
import { nanoid } from "nanoid";

export const useEditor = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);

  const addBlock = (type: string) => {
    const base = {
      id: nanoid(),
      type,
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      isEditing: false,
    };

    let block: any = {};

    switch (type) {
      case "text":
        block = {
          ...base,
          label: "テキスト",
          fontSize: 16,
          color: "#000000",
        };
        break;
      case "line":
        block = {
          ...base,
          width: 200,
          height: 2,
          borderColor: "#000000",
          borderWidth: 2,
        };
        break;
      case "rect":
        block = {
          ...base,
          borderColor: "#000000",
          borderWidth: 2,
          backgroundColor: "transparent",
        };
        break;
      case "circle":
        block = {
          ...base,
          borderColor: "#000000",
          borderWidth: 2,
          backgroundColor: "transparent",
        };
        break;
      case "triangle":
        block = {
          ...base,
          color: "#000000",
          rotate: 0,
        };
        break;
      case "arrow":
        block = {
          ...base,
          color: "#000000",
          borderWidth: 4,
          arrowSize: 10,
          rotate: 0,
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
          cells: Array.from({ length: rows }).map(() =>
            Array.from({ length: cols }).map(() => ({
              text: "",
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
        };
        break;
    }

    setBlocks((prev) => [...prev, block]);
    setSelectedBlock(block);
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
  };

  return {
    blocks,
    addBlock,
    updateBlock,
    selectedBlock,
    selectBlock,
  };
};