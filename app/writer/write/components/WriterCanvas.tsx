"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import CanvasContainer from "./CanvasContainer";
import ScaledCanvas from "./ScaledCanvas";
import PaperCanvas from "./PaperCanvas";
import FloatingPropertyBox from "./FloatingPropertyBox";
import WriterPageTabs from "./WriterPageTabs";

interface Page {
  id: string;
  number: number;
  blocks: any[];
}

interface WriterCanvasProps {
  blocks: any[];
  selectedBlock: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onSelectBlock: (id: string | null) => void;

  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  gridSize: number;
  setGridSize: (v: number) => void;

  snapMode: string;
  setSnapMode: (v: string) => void;

  zoom: number;
  setZoom: (v: number) => void;

paper: string;
orientation: string;
currentPage: number;

  showPropertyBox: boolean;
  setShowPropertyBox: (v: boolean) => void;

  onSaveDraft: () => void;
  onOverwriteDraft: () => void;
  currentDocumentId: string | null;

  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  readOnly?: boolean;

  pages: Page[];
  onSwitchPage: (pageNumber: number) => void;
  onDeletePage: (pageNumber: number) => void;
}

const sizes = {
  A4: { w: 794, h: 1123 },
  A3: { w: 1123, h: 1587 },
} as const;

const WriterCanvas: React.FC<WriterCanvasProps> = ({
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
  readOnly = false,
  pages,
  onSwitchPage,
  onDeletePage,
}) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  /** ------------------------------
   *  A3/A4 + 縦横の動的サイズ計算
   * ------------------------------ */
const base = sizes[paper as keyof typeof sizes] ?? sizes["A4"];
const pageWidth = orientation === "portrait" ? base.w : base.h;
const pageHeight = orientation === "portrait" ? base.h : base.w;

  /** ------------------------------
   *  スナップ
   * ------------------------------ */
  const snap = (x: number, y: number) => {
    if (snapMode) {
      const size = gridSize;
      return {
        x: Math.round(x / size) * size,
        y: Math.round(y / size) * size,
      };
    }
    return { x, y };
  };

  const getCanvasRect = () => {
    if (!canvasRef.current)
      return new DOMRect(0, 0, pageWidth, pageHeight);
    return canvasRef.current.getBoundingClientRect();
  };

  /** ------------------------------
   *  印刷用 CSS を動的注入
   * ------------------------------ */
  const injectPrintStyles = () => {
    const styleId = "writer-print-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const pageSize =
      orientation === "portrait"
        ? `${paper} portrait`
        : `${paper} landscape`;

    styleEl.textContent = `
      @page {
        size: ${pageSize};
        margin: 0mm;
      }

      .writer-paper {
        width: ${pageWidth}px !important;
        height: ${pageHeight}px !important;
      }
    `;
  };

  /** ------------------------------
   *  設定パネル
   * ------------------------------ */
  const SettingsPanel = (
    <div className="no-print flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200 select-none">
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => setShowGrid(e.target.checked)}
        />
        グリッド
      </label>

      <label className="flex items-center gap-1">
        <span>サイズ</span>
        <input
          type="number"
          min={4}
          max={100}
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="w-16 px-1 py-0.5 border rounded"
        />
      </label>

      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={!!snapMode}
          onChange={(e) => setSnapMode(e.target.checked ? "grid" : "none")}
        />
        スナップ
      </label>

      <label className="flex items-center gap-1">
        <span>ズーム</span>
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="border rounded px-1 py-0.5"
        >
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((z) => (
            <option key={z} value={z}>
              {Math.round(z * 100)}%
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Redo
      </button>

      <button
        onClick={onSaveDraft}
        className="px-2 py-1 border rounded bg-blue-500 text-white"
      >
        一時保存
      </button>

      {currentDocumentId && (
        <button
          onClick={onOverwriteDraft}
          className="px-2 py-1 border rounded bg-green-500 text-white"
        >
          上書き保存
        </button>
      )}

      <button
        onClick={() => {
          injectPrintStyles();
          setTimeout(() => window.print(), 100);
        }}
        className="px-2 py-1 border rounded bg-gray-200"
      >
        印刷プレビュー
      </button>

      {/* プレビュー用ボタン（右端） */}
      <button
        onClick={() => {
          if (currentDocumentId) {
            router.push(`/writer/preview/${currentDocumentId}`);
          } else {
            alert("文書が保存されていません。まず一時保存してください。");
          }
        }}
        className="px-2 py-1 border rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        プレビュー
      </button>
    </div>
  );

  /** ------------------------------
   *  レンダリング
   * ------------------------------ */
  return (
    <div className="flex flex-col h-full w-full relative">
      {SettingsPanel}

      {showPropertyBox && selectedBlock && (
        <FloatingPropertyBox
          block={selectedBlock}
          onUpdateBlock={onUpdateBlock}
          onClose={() => setShowPropertyBox(false)}
          canvasRect={getCanvasRect()}
        />
      )}

      <CanvasContainer>
        <ScaledCanvas zoom={zoom} className="print-area">
          <div
            style={{
              width: pageWidth,
              minHeight: pageHeight,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 40,
            }}
          >
            <PaperCanvas
              ref={canvasRef}
              width={pageWidth}
              height={pageHeight}
              showGrid={showGrid}
              gridSize={gridSize}
              blocks={blocks}
              selectedBlock={selectedBlock}
              onSelectBlock={onSelectBlock}
              onUpdateBlock={onUpdateBlock}
              readOnly={readOnly}
              currentPage={currentPage}
              snap={snap}
              onDoubleClickBlock={() => setShowPropertyBox(true)}
            />
          </div>
        </ScaledCanvas>
      </CanvasContainer>

      <WriterPageTabs
        pages={pages}
        currentPage={currentPage}
        onSwitchPage={onSwitchPage}
        onDeletePage={onDeletePage}
        className="no-print"
      />
    </div>
  );
};

export default WriterCanvas;