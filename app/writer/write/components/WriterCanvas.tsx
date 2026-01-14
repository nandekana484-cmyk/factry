"use client";

import { useEffect } from "react";
import TextBlock from "@/components/TextBlock";
import ShapeBlock from "@/components/ShapeBlock";
import PlaceholderBlock from "@/components/PlaceholderBlock";
import {
  PrinterIcon,
  DocumentPlusIcon,
  ArrowUpOnSquareIcon,
  Cog6ToothIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

interface WriterCanvasProps {
  blocks: any[];
  selectedBlock: any;
  onUpdateBlock: (id: string, updated: any) => void;
  onSelectBlock: (id: string | null) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  snapMode: boolean;
  setSnapMode: (mode: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  paper: string;
  orientation: string;
  currentPage: number;
  showPropertyBox: boolean;
  setShowPropertyBox: (show: boolean) => void;
  onSaveDraft: () => void;
  onOverwriteDraft: () => void;
  currentDocumentId: string | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * WriterCanvas
 * 中央のブロック描画エリアを担当
 */
export default function WriterCanvas({
  blocks,
  selectedBlock,
  onUpdateBlock,
  onSelectBlock,
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  snapMode,
  setSnapMode,
  zoom,
  setZoom,
  paper,
  orientation,
  currentPage,
  showPropertyBox,
  setShowPropertyBox,
  onSaveDraft,
  onOverwriteDraft,
  currentDocumentId,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: WriterCanvasProps) {
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
      onSelectBlock(null);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelectBlock]);

  const sizes: any = {
    A4: { w: 794, h: 1123 },
    A3: { w: 1123, h: 1587 },
  };

  // paperとorientationのデフォルト値を確保
  const currentPaper = paper || "A4";
  const currentOrientation = orientation || "portrait";
  
  const base = sizes[currentPaper] || sizes["A4"];
  const width = currentOrientation === "portrait" ? base.w : base.h;
  const height = currentOrientation === "portrait" ? base.h : base.w;

  // デバッグ用（値の変更を確認）
  useEffect(() => {
    console.log("Writer Canvas - Paper:", currentPaper, "Orientation:", currentOrientation, "Width:", width, "Height:", height);
  }, [currentPaper, currentOrientation, width, height]);

  // スナップ関数（Writerでは移動不可なので実質使われない）
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

    const pageSize = currentOrientation === "portrait" 
      ? `${currentPaper} portrait` 
      : `${currentPaper} landscape`;

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
        <div className="text-sm text-gray-600">
          用紙: {currentPaper} {currentOrientation === "portrait" ? "縦" : "横"}
        </div>

        <div className="border-l h-6 mx-2"></div>

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
          >
            <PrinterIcon className="w-6 h-6" />
          </button>

          {/* 上書き保存ボタン（文書IDがある場合のみ表示） */}
          {currentDocumentId && (
            <button
              onClick={onOverwriteDraft}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
              title="現在の下書きを上書き保存"
              aria-label="上書き保存"
            >
              <ArrowUpOnSquareIcon className="w-6 h-6" />
            </button>
          )}

          {/* 名前を付けて保存ボタン */}
          <button
            onClick={onSaveDraft}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
            title="名前を付けて保存"
            aria-label="名前を付けて保存"
          >
            <DocumentPlusIcon className="w-6 h-6" />
          </button>

          {/* プロパティボタン */}
          <button
            onClick={() => setShowPropertyBox(!showPropertyBox)}
            className={`p-2 rounded transition ${
              showPropertyBox
                ? "text-blue-600 bg-blue-50"
                : "text-blue-600 hover:bg-blue-50"
            }`}
            title={showPropertyBox ? "プロパティを閉じる" : "プロパティを表示"}
            aria-label="プロパティ"
          >
            <Cog6ToothIcon className="w-6 h-6" />
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
            >
              {blocks.map((block: any) => {
                const isSelected = selectedBlock?.id === block.id;
                const isTextBlock = ["text", "titlePlaceholder", "subtitlePlaceholder"].includes(block.type);
                const isPlaceholder = ["approvalStampPlaceholder", "managementNumberPlaceholder"].includes(block.type);

                if (isTextBlock) {
                  return (
                    <TextBlock
                      key={block.id}
                      block={block}
                      isSelected={isSelected}
                      selectedBlock={selectedBlock}
                      updateBlock={onUpdateBlock}
                      selectBlock={onSelectBlock}
                      snap={snap}
                      isReadOnly={false}
                      isTextEditable={true}
                    />
                  );
                }
                
                if (isPlaceholder) {
                  return (
                    <PlaceholderBlock
                      key={block.id}
                      block={block}
                      isSelected={isSelected}
                      updateBlock={onUpdateBlock}
                      selectBlock={onSelectBlock}
                      snap={snap}
                      isReadOnly={true}
                      currentPage={currentPage}
                    />
                  );
                }
                
                return (
                  <ShapeBlock
                    key={block.id}
                    block={block}
                    blocks={blocks}
                    isSelected={isSelected}
                    updateBlock={onUpdateBlock}
                    selectBlock={onSelectBlock}
                    snap={snap}
                    isReadOnly={block.isTemplateBlock === true}
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
