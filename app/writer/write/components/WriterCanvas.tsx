"use client";

import React, { useRef } from "react";
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

  // ページ管理用
  pages: Page[];
  onSwitchPage: (pageNumber: number) => void;
  onDeletePage: (pageNumber: number) => void;
}

const CANVAS_WIDTH = 794; // A4 px
const CANVAS_HEIGHT = 1123;


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
  // refは現在ページのPaperCanvasにのみ付与
  const canvasRef = useRef<HTMLDivElement>(null);

  // snapModeはbooleanでON/OFF
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

  // 設定パネルUI
  const SettingsPanel = (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200 select-none">
      {/* グリッドON/OFF */}
      <label className="flex items-center gap-1">
        <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
        グリッド
      </label>
      {/* グリッドサイズ */}
      <label className="flex items-center gap-1">
        <span>サイズ</span>
        <input type="number" min={4} max={100} value={gridSize} onChange={e => setGridSize(Number(e.target.value))} className="w-16 px-1 py-0.5 border rounded" />
      </label>
      {/* スナップON/OFF */}
      <label className="flex items-center gap-1">
        <input type="checkbox" checked={!!snapMode} onChange={e => setSnapMode(e.target.checked ? "grid" : "none")} />
        スナップ
      </label>
      {/* ズーム（セレクトボックス） */}
      <label className="flex items-center gap-1">
        <span>ズーム</span>
        <select value={zoom} onChange={e => setZoom(Number(e.target.value))} className="border rounded px-1 py-0.5">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(z => (
            <option key={z} value={z}>{Math.round(z * 100)}%</option>
          ))}
        </select>
      </label>
      {/* Undo/Redo */}
      <button onClick={onUndo} disabled={!canUndo} className="px-2 py-1 border rounded disabled:opacity-50">Undo</button>
      <button onClick={onRedo} disabled={!canRedo} className="px-2 py-1 border rounded disabled:opacity-50">Redo</button>
      {/* 保存/上書き保存 */}
      <button onClick={onSaveDraft} className="px-2 py-1 border rounded bg-blue-500 text-white">一時保存</button>
      {currentDocumentId && (
        <button onClick={onOverwriteDraft} className="px-2 py-1 border rounded bg-green-500 text-white">上書き保存</button>
      )}
      {/* 印刷プレビュー */}
      <button onClick={() => window.print()} className="px-2 py-1 border rounded bg-gray-200">印刷プレビュー</button>
      {/* プロパティボックス表示/非表示 */}
      <label className="flex items-center gap-1 ml-4">
        <input type="checkbox" checked={showPropertyBox} onChange={e => setShowPropertyBox(e.target.checked)} />
        プロパティボックス
      </label>
    </div>
  );

  // blocks からページ数を算出
  const totalPages = Math.max(1, ...blocks.map((b) => b.page || 1));

  // FloatingPropertyBoxの位置計算用: 現在ページのPaperCanvasのDOMRect
  const getCanvasRect = () => {
    if (!canvasRef.current) return new DOMRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return canvasRef.current.getBoundingClientRect();
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {SettingsPanel}
      <CanvasContainer>
        {/* transform の外側に置く */}
        {showPropertyBox && selectedBlock && (
          <FloatingPropertyBox
            block={selectedBlock}
            onUpdateBlock={onUpdateBlock}
            onClose={() => setShowPropertyBox(false)}
            canvasRect={getCanvasRect()}
          />
        )}
        <ScaledCanvas zoom={zoom}>
          {/* 現在ページのみPaperCanvasを描画し、refも付与 */}
          <div
            style={{
              width: CANVAS_WIDTH,
              minHeight: CANVAS_HEIGHT,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 40,
            }}
          >
            <PaperCanvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              showGrid={showGrid}
              gridSize={gridSize}
              blocks={blocks}
              selectedBlock={selectedBlock}
              onSelectBlock={onSelectBlock}
              onUpdateBlock={onUpdateBlock}
              readOnly={readOnly}
              currentPage={currentPage}
              snap={snap}
            />
          </div>
        </ScaledCanvas>
      </CanvasContainer>
      {/* ページタブを最下部に追加 */}
      <WriterPageTabs
        pages={pages}
        currentPage={currentPage}
        onSwitchPage={onSwitchPage}
        onDeletePage={onDeletePage}
      />
    </div>
  );
};

export default WriterCanvas;