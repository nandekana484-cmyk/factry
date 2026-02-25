"use client";

import { Rnd } from "react-rnd";
import React, { useMemo } from "react";

function PlaceholderBlockComponent({
  block,
  isSelected,
  updateBlock,
  selectBlock,
  snap,
  isReadOnly = false,
  currentPage = 1,
}: any) {
  const isEditable = block.editable !== false && !isReadOnly;
  const showDiagonalLine =
    currentPage > 1 && block.type === "approvalStampPlaceholder";

  /** Rnd の size / position を useMemo で安定化 */
  const size = useMemo(
    () => ({
      width: Math.round(block.width),
      height: Math.round(block.height),
    }),
    [block.width, block.height]
  );

  const position = useMemo(
    () => ({
      x: Math.round(block.x),
      y: Math.round(block.y),
    }),
    [block.x, block.y]
  );

  /** snap を統一的に扱うラッパー（数値 or {x,y} 両対応） */
  const applySnapXY = (x: number, y: number) => {
    if (!snap) return { x, y };
    const sx = snap(x);
    const sy = snap(y);
    return { x: sx, y: sy };
  };

  const applySnapSize = (w: number, h: number) => {
    if (!snap) return { w, h };
    const sw = snap(w);
    const sh = snap(h);
    return { w: sw, h: sh };
  };

  return (
    <Rnd
      // ❌ key={block.id} は付けない
      data-block-id={block.id}
      size={size}
      position={position}
      bounds="parent"
      disableDragging={isReadOnly}
      enableResizing={isReadOnly ? false : isSelected}
      onMouseDown={(e) => {
        if (isReadOnly) return;
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onDragStop={(e, d) => {
        if (isReadOnly) return;
        const snapped = applySnapXY(d.x, d.y);
        updateBlock(block.id, { x: snapped.x, y: snapped.y });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        if (isReadOnly) return;

        const parsedWidth = parseFloat(ref.style.width) || block.width;
        const parsedHeight = parseFloat(ref.style.height) || block.height;

        const snappedSize = applySnapSize(parsedWidth, parsedHeight);
        const snappedPos = applySnapXY(pos.x, pos.y);

        updateBlock(block.id, {
          width: snappedSize.w,
          height: snappedSize.h,
          x: snappedPos.x,
          y: snappedPos.y,
        });
      }}
      style={{
        outline: isReadOnly
          ? "none"
          : isSelected
          ? "3px solid #4A90E2"
          : "none",
        outlineOffset: "0px",
        cursor: isReadOnly ? "default" : "move",
        zIndex: block.zIndex || 1500,
        boxSizing: "border-box",
      }}
    >
      {/* プレースホルダーコンテンツ */}
      <div
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* --- 承認印プレースホルダー --- */}
        {block.type === "approvalStampPlaceholder" && (
          <div
            className="approval-border"
            style={{
              width: "100%",
              height: "100%",
              border: `${Math.round(block.borderWidth || 2)}px dashed ${
                block.borderColor || "#999999"
              }`,
              backgroundColor: block.backgroundColor || "transparent",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#999999",
              padding: "4px",
              textAlign: "center",
              pointerEvents: "none",
              position: "relative",
            }}
          >
            <div style={{ fontWeight: "bold" }}>承認印</div>
            <div style={{ fontSize: "11px" }}>({block.role})</div>

            {/* 2ページ目以降は斜線を追加 */}
            {showDiagonalLine && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: "none",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="#999999"
                    strokeWidth="2"
                  />
                  <line
                    x1="100%"
                    y1="0"
                    x2="0"
                    y2="100%"
                    stroke="#999999"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* --- 管理番号プレースホルダー --- */}
        {block.type === "managementNumberPlaceholder" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              border: `${Math.round(block.borderWidth || 1)}px solid ${
                block.borderColor || "#666666"
              }`,
              backgroundColor: block.backgroundColor || "transparent",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              color: "#666666",
              padding: "2px",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontWeight: "bold" }}>管理番号</div>
          </div>
        )}
      </div>
    </Rnd>
  );
}

export default React.memo(PlaceholderBlockComponent);