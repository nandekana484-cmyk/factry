"use client";

import { useState, useEffect, useRef } from "react";

interface FloatingPropertyBoxProps {
  block: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onClose: () => void;
  canvasRect: DOMRect;
}

export default function FloatingPropertyBox({ block, onUpdateBlock, onClose, canvasRect }: FloatingPropertyBoxProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  // 初期位置：Canvas内絶対座標基準、右上
  useEffect(() => {
    if (!block || !canvasRect) return;
    const initialX = block.x + block.width + 20;
    const initialY = block.y - 20;
    setPosition({
      x: Math.max(0, initialX),
      y: Math.max(0, initialY),
    });
  }, [block, canvasRect]);

  // 画面外補正（右下はみ出しのみ）
  useEffect(() => {
    if (!boxRef.current) return;
    const { x, y } = position;
    const box = boxRef.current.getBoundingClientRect();
    let newX = x, newY = y;
    if (newX + box.width > canvasRect.width) newX = canvasRect.width - box.width;
    if (newY + box.height > canvasRect.height) newY = canvasRect.height - box.height;
    if (newX !== x || newY !== y) setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
  }, [position, canvasRect]);

  // ドラッグ操作
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  if (!block) return null;

  // 編集不可判定
  const isTemplateBlock = block.source === "template";
  const isApprovalStamp = block.type === "approvalStampPlaceholder";

  // 動的プロパティUI
  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        background: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        borderRadius: "12px",
        padding: "16px",
        minWidth: 260,
        maxWidth: 340,
      }}
      className="shadow-lg rounded-lg p-3"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* グリップバー */}
      <div
        style={{ cursor: "move", background: "#eee", height: 18, borderRadius: 6, marginBottom: 8 }}
        onMouseDown={handleMouseDown}
      />
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm">プロパティ</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-lg">×</button>
      </div>
      <div className="space-y-3">
        <div className="text-xs text-gray-400">ID: {block.id}</div>
        <div className="text-xs text-gray-400">タイプ: {block.type}</div>
        {/* テンプレート・承認印は編集不可 */}
        {(isTemplateBlock || isApprovalStamp) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">編集不可ブロックです</div>
        )}
        {/* テキストブロック */}
        {block.type === "text" && !isTemplateBlock && !isApprovalStamp && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">テキスト</label>
              <textarea
                value={block.label || block.value || ""}
                onChange={e => onUpdateBlock(block.id, { label: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">フォントサイズ</label>
              <input
                type="number"
                value={block.fontSize || 16}
                onChange={e => onUpdateBlock(block.id, { fontSize: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">文字色</label>
              <input
                type="color"
                value={block.color || "#000000"}
                onChange={e => onUpdateBlock(block.id, { color: e.target.value })}
                className="w-12 h-8 border rounded"
              />
            </div>
          </>
        )}
        {/* 図形ブロック */}
        {["rect", "circle", "triangle", "arrow", "line"].includes(block.type) && !isTemplateBlock && !isApprovalStamp && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">幅</label>
              <input
                type="number"
                value={Math.round(block.width || 0)}
                onChange={e => onUpdateBlock(block.id, { width: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">高さ</label>
              <input
                type="number"
                value={Math.round(block.height || 0)}
                onChange={e => onUpdateBlock(block.id, { height: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">塗り</label>
              <input
                type="color"
                value={block.fillColor || "#ffffff"}
                onChange={e => onUpdateBlock(block.id, { fillColor: e.target.value })}
                className="w-12 h-8 border rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">線色</label>
              <input
                type="color"
                value={block.borderColor || "#000000"}
                onChange={e => onUpdateBlock(block.id, { borderColor: e.target.value })}
                className="w-12 h-8 border rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">線幅</label>
              <input
                type="number"
                value={block.borderWidth || 1}
                onChange={e => onUpdateBlock(block.id, { borderWidth: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
