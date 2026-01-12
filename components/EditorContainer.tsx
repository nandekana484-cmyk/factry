"use client";

import { useState, useRef, useEffect } from "react";
import TextBlock from "./TextBlock";
import ShapeBlock from "./ShapeBlock";
import PlaceholderBlock from "./PlaceholderBlock";

export default function EditorContainer({ blocks, selectedBlock, updateBlock, selectBlock, deleteBlock, selectedCell, setSelectedCell, onSaveTemplate, onNewTemplate }: any) {
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [gridSize, setGridSize] = useState(20);
  const [snapMode, setSnapMode] = useState(true);
  const rndRefs = useRef<{ [key: string]: any }>({});

  // Deleteキーでブロック削除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedBlock) {
        e.preventDefault();
        deleteBlock(selectedBlock.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlock, deleteBlock]);

  const sizes: any = {
    A4: { w: 794, h: 1123 },
    A3: { w: 1123, h: 1587 },
  };

  const base = sizes[paper];
  const width = orientation === "portrait" ? base.w : base.h;
  const height = orientation === "portrait" ? base.h : base.w;

  // 要件1・2: スナップ関数: 座標とサイズを gridSize 単位に丸める（必ず整数を返す）
  const snap = (value: number, size: number = gridSize): number => {
    const rounded = Math.round(value); // 最初に整数に丸める
    if (!snapMode) {
      return rounded; // snapMode OFF でも整数化
    }
    // snapMode ON: gridSize 単位で丸める
    return Math.round(rounded / size) * size;
  };

  // 要件4: グリッドのセンター割り計算（整数に丸める）
  const offsetX = Math.round((width / 2) % gridSize);
  const offsetY = Math.round((height / 2) % gridSize);

  return (
    <div className="flex flex-col flex-1 bg-gray-50 p-4 overflow-auto">
      {/* 設定パネル */}
      <div className="flex gap-4 mb-4 items-center bg-white p-3 shadow-sm rounded">
        <select value={paper} onChange={(e) => setPaper(e.target.value)} className="border p-2 rounded">
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>

        <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="border p-2 rounded">
          <option value="portrait">縦</option>
          <option value="landlandscape">横</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
          グリッド
        </label>

        <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="border p-2 rounded">
          <option value={10}>10px</option>
          <option value={20}>20px</option>
          <option value={40}>40px</option>
          <option value={80}>80px</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={snapMode} onChange={() => setSnapMode(!snapMode)} />
          スナップ
        </label>

        <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="border p-2 rounded">
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.5}>150%</option>
        </select>

        <button
          onClick={onNewTemplate}
          className="ml-auto px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition font-medium"
        >
          新規作成
        </button>

        <button
          onClick={onSaveTemplate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-medium"
        >
          保存
        </button>
      </div>

      {/* キャンバス */}
      <div className="overflow-auto flex justify-center">
        {/* 要件3: transformOrigin を "top left" に変更してズレを防ぐ */}
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", willChange: "transform" }}>
          {/* 要件4, 5: グリッド背景を整数化して設定 */}
          <div
            className="relative bg-white shadow-lg"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              border: "1px solid #ccc",
              backgroundImage: showGrid
                ? `linear-gradient(#e5e5e5 1px, transparent 1px),
                   linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`
                : "none",
              backgroundSize: showGrid ? `${Math.round(gridSize)}px ${Math.round(gridSize)}px` : "none",
              backgroundPosition: showGrid ? `${offsetX}px ${offsetY}px` : "none",
              backgroundAttachment: "local",
            }}
          >
            {blocks.map((block: any) => {
              const isSelected = selectedBlock?.id === block.id;
              const isTextBlock = ["text", "titlePlaceholder"].includes(block.type);
              const isPlaceholder = ["approvalStampPlaceholder", "managementNumberPlaceholder"].includes(block.type);

              return isTextBlock ? (
                <TextBlock
                  key={block.id}
                  block={block}
                  isSelected={isSelected}
                  selectedBlock={selectedBlock}
                  updateBlock={updateBlock}
                  selectBlock={selectBlock}
                  snap={snap}
                />
              ) : isPlaceholder ? (
                <PlaceholderBlock
                  key={block.id}
                  block={block}
                  isSelected={isSelected}
                  updateBlock={updateBlock}
                  selectBlock={selectBlock}
                  snap={snap}
                />
              ) : (
                <ShapeBlock
                  key={block.id}
                  block={block}
                  isSelected={isSelected}
                  updateBlock={updateBlock}
                  selectBlock={selectBlock}
                  snap={snap}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}