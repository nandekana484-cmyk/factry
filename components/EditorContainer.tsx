"use client";

import { useEffect } from "react";
import TextBlock from "./TextBlock";
import ShapeBlock from "./ShapeBlock";
import PlaceholderBlock from "./PlaceholderBlock";
import {
  PrinterIcon,
  DocumentPlusIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
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
      // 編集モード中はブロック削除を行わない
      if (e.key === "Delete" && selectedBlock && !selectedBlock.isEditing) {
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

  // デバッグ用
  console.log("Paper:", paper, "Orientation:", orientation, "Width:", width, "Height:", height);

  // スナップ関数
  const snap = (value: number, size: number = gridSize): number => {
    const rounded = Math.round(value);
    if (!snapMode) return rounded;
    return Math.round(rounded / size) * size;
  };

  const offsetX = Math.round((width / 2) % gridSize);
  const offsetY = Math.round((height / 2) % gridSize);

  // 印刷プレビュー関数
  const handlePrint = () => {
    // 印刷用CSSを動的に追加
    const styleId = 'dynamic-print-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const pageSize = orientation === "portrait" 
      ? `${paper} portrait` 
      : `${paper} landscape`;

    // 余白設定: 上・右・下・左 (下のみ5mm、他は0mm)
    const margin = '0mm 0mm 5mm 0mm';

    styleEl.textContent = `
      @page {
        size: ${pageSize};
        margin: ${margin};
      }

      @media print {
        body * {
          visibility: hidden;
        }
        
        .print-area,
        .print-area * {
          visibility: visible !important;
        }
        
        /* SVG要素とマーカーを確実に表示 */
        svg,
        svg *,
        marker,
        marker * {
          visibility: visible !important;
        }
        
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        
        .no-print {
          display: none !important;
        }
        
        /* 図形のボーダーを確実に印刷 */
        [data-block-id] {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 overflow-hidden">
      {/* 設定パネル */}
      <div 
        className="flex gap-4 m-4 mb-0 items-center bg-white p-3 shadow-sm rounded"
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

        {/* アイコンボタン群 */}
        <div className="ml-auto flex items-center gap-1 no-print">
          {/* Undoボタン */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded transition ${
              canUndo
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="元に戻す (Ctrl+Z)"
            aria-label="元に戻す"
            data-ignore-deselect="true"
          >
            <ArrowUturnLeftIcon className="w-6 h-6" />
          </button>

          {/* Redoボタン */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded transition ${
              canRedo
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="やり直し (Ctrl+Y)"
            aria-label="やり直し"
            data-ignore-deselect="true"
          >
            <ArrowUturnRightIcon className="w-6 h-6" />
          </button>

          <div className="border-l h-6 mx-1"></div>

          {/* 印刷プレビューボタン */}
          <button
            onClick={handlePrint}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition"
            title="印刷プレビュー"
            aria-label="印刷プレビュー"
            data-ignore-deselect="true"
          >
            <PrinterIcon className="w-6 h-6" />
          </button>

          {/* 新規作成ボタン */}
          <button
            onClick={onNewTemplate}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
            title="新規作成"
            aria-label="新規作成"
            data-ignore-deselect="true"
          >
            <PlusIcon className="w-6 h-6" />
          </button>

          {/* 保存ボタン */}
          <button
            onClick={onSaveTemplate}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
            title="保存"
            aria-label="保存"
            data-ignore-deselect="true"
          >
            <DocumentPlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* キャンバス */}
      <div className="flex-1 overflow-auto print-area">
        <div 
          style={{ 
            padding: "50px",
            width: `${width * zoom + 100}px`,
            height: `${height * zoom + 100}px`,
            margin: "0 auto"
          }}
        >
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
                const isTextBlock = ["text", "titlePlaceholder", "subtitlePlaceholder"].includes(
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