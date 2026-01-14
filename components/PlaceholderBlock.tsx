"use client";

import { Rnd } from "react-rnd";

export default function PlaceholderBlock({
  block,
  isSelected,
  updateBlock,
  selectBlock,
  snap,
  isReadOnly = false,
  currentPage = 1,
}: any) {
  const isEditable = block.editable !== false && !isReadOnly;
  const showDiagonalLine = currentPage > 1 && block.type === "approvalStampPlaceholder";

  return (
    <Rnd
      key={block.id}
      data-block-id={block.id}
      size={{
        width: Math.round(block.width),
        height: Math.round(block.height),
      }}
      position={{
        x: Math.round(block.x),
        y: Math.round(block.y),
      }}
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
        // グリッドサイズに完全にスナップ
        const newX = snap(d.x);
        const newY = snap(d.y);
        updateBlock(block.id, { x: newX, y: newY });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        if (isReadOnly) return;
        const parsedWidth = parseFloat(ref.style.width) || block.width;
        const parsedHeight = parseFloat(ref.style.height) || block.height;

        // サイズと位置を完全にグリッドスナップ
        const newWidth = snap(parsedWidth);
        const newHeight = snap(parsedHeight);
        const newX = snap(pos.x);
        const newY = snap(pos.y);

        updateBlock(block.id, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        });
      }}
      style={{
        outline: isReadOnly ? "none" : (isSelected ? "3px solid #4A90E2" : "none"),
        outlineOffset: isSelected ? "0px" : "0px",
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
              <>
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
              </>
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
