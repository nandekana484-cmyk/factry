"use client";

import { useEffect } from "react";
import TextBlock from "./TextBlock";
import ShapeBlock from "./ShapeBlock";
import PlaceholderBlock from "./PlaceholderBlock";

/**
 * EditorContainer - テンプレート編集専用コンポーネント
 * useTemplateEditorと連携してテンプレート編集機能を提供
 */
export default function EditorContainer({
  blocks = [],
  selectedBlock,
  updateBlock,
  selectBlock,
  deleteBlock,
  selectedCell,
  setSelectedCell,
  onSaveTemplate,
  onNewTemplate,
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
}: any) {

  // Deleteキーでブロック削除、ESCキーで選択解除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedBlock) {
        e.preventDefault();
        deleteBlock(selectedBlock.id);
      }
      // ESCキーで選択解除（編集中でない場合のみ）
      if (e.key === "Escape" && selectedBlock && !selectedBlock.isEditing) {
        e.preventDefault();
        selectBlock(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlock, deleteBlock, selectBlock]);

  // グローバルクリックリスナーでキャンバス外クリックも選択解除
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // data-block-idを持つ要素（ブロック）をクリックした場合は何もしない
      if (target.closest('[data-block-id]')) {
        return;
      }
      
      // data-ignore-deselectを持つ要素（UIボタンなど）をクリックした場合は何もしない
      if (target.closest('[data-ignore-deselect]')) {
        return;
      }
      
      // 上記以外の場合は選択解除
      selectBlock(null);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectBlock]);

  const sizes: any = {
    A4: { w: 794, h: 1123 },
    A3: { w: 1123, h: 1587 },
  };

  const base = sizes[paper];
  const width = orientation === "portrait" ? base.w : base.h;
  const height = orientation === "portrait" ? base.h : base.w;

  // スナップ関数
  const snap = (value: number, size: number = gridSize): number => {
    const rounded = Math.round(value);
    if (!snapMode) return rounded;
    return Math.round(rounded / size) * size;
  };

  const offsetX = Math.round((width / 2) % gridSize);
  const offsetY = Math.round((height / 2) % gridSize);

  return (
    <div className="flex flex-col flex-1 bg-gray-50 p-4 overflow-auto">
      {/* 設定パネル */}
      <div 
        className="flex gap-4 mb-4 items-center bg-white p-3 shadow-sm rounded"
        data-ignore-deselect="true"
      >
        <select
          value={paper}
          onChange={(e) => setPaper(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>

        <select
          value={orientation}
          onChange={(e) => setOrientation(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="portrait">縦</option>
          <option value="landlandscape">横</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={() => setShowGrid(!showGrid)}
          />
          グリッド
        </label>

        <select
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={10}>10px</option>
          <option value={20}>20px</option>
          <option value={40}>40px</option>
          <option value={80}>80px</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={snapMode}
            onChange={() => setSnapMode(!snapMode)}
          />
          スナップ
        </label>

        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
        </select>

        <button
          onClick={onNewTemplate}
          className="ml-auto px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition font-medium"
          data-ignore-deselect="true"
        >
          新規作成
        </button>

        <button
          onClick={onSaveTemplate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-medium"
          data-ignore-deselect="true"
        >
          保存
        </button>
      </div>

      {/* キャンバス */}
      <div className="overflow-auto flex justify-center">
        <div style={{ padding: "20px" }}>
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
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
              backgroundSize: showGrid
                ? `${Math.round(gridSize)}px ${Math.round(gridSize)}px`
                : "none",
              backgroundPosition: showGrid
                ? `${offsetX}px ${offsetY}px`
                : "none",
              backgroundAttachment: "local",
            }}
              onClick={(e) => {
                // キャンバス背景のクリック時に選択解除
                // ブロック側でstopPropagationしているため、ブロッククリックは除外される
                if (e.target === e.currentTarget) {
                  selectBlock(null);
                }
              }}
          >
            {Array.isArray(blocks) && blocks.map((block: any) => {
                const isSelected = selectedBlock?.id === block.id;
                const isTextBlock = ["text", "titlePlaceholder"].includes(
                  block.type
                );
                const isPlaceholder = [
                  "approvalStampPlaceholder",
                  "managementNumberPlaceholder",
                ].includes(block.type);

                return isTextBlock ? (
                  <TextBlock
                    key={block.id}
                    block={block}
                    isSelected={isSelected}
                    selectedBlock={selectedBlock}
                    updateBlock={updateBlock}
                    selectBlock={selectBlock}
                    snap={snap}
                    isReadOnly={false}
                  />
                ) : isPlaceholder ? (
                  <PlaceholderBlock
                    key={block.id}
                    block={block}
                    isSelected={isSelected}
                    updateBlock={updateBlock}
                    selectBlock={selectBlock}
                    snap={snap}
                    isReadOnly={false}
                  />
                ) : (
                  <ShapeBlock
                    key={block.id}
                    block={block}
                    blocks={blocks}
                    isSelected={isSelected}
                    updateBlock={updateBlock}
                    selectBlock={selectBlock}
                    snap={snap}
                    isReadOnly={false}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}