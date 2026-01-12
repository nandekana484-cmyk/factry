"use client";

import { Rnd } from "react-rnd";

export default function PlaceholderBlock({
  block,
  isSelected,
  updateBlock,
  selectBlock,
  snap,
}: any) {
  const isEditable = block.editable !== false;

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
      disableDragging={!isEditable || !isSelected || block.isEditing}
      enableResizing={isEditable && isSelected && !block.isEditing}
      dragHandleClassName="placeholder-handle"
      style={{
        zIndex: isSelected ? 1000 : 1,
      }}
      onClick={() => selectBlock(block.id)}
      onDragStart={() => selectBlock(block.id)}
      onDragStop={(e, d) => {
        const newX = snap(Math.round(d.x));
        const newY = snap(Math.round(d.y));
        updateBlock(block.id, { x: newX, y: newY });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        const parsedWidth = parseFloat(ref.style.width) || block.width;
        const parsedHeight = parseFloat(ref.style.height) || block.height;

        const newWidth = snap(Math.round(parsedWidth));
        const newHeight = snap(Math.round(parsedHeight));
        const newX = snap(Math.round(pos.x));
        const newY = snap(Math.round(pos.y));

        updateBlock(block.id, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        });
      }}
    >
      {/* ドラッグハンドル・選択枠 */}
      <div
        className="placeholder-handle"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: isSelected ? "2px solid #4A90E2" : "2px solid transparent",
          boxSizing: "border-box",
          cursor: isSelected && !block.isEditing ? "move" : "default",
          zIndex: 200,
          pointerEvents: "auto",
        }}
      />

      {/* プレースホルダーコンテンツ */}
      <div
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: block.isEditing ? "auto" : "none",
        }}
      >
        {/* --- 承認印プレースホルダー --- */}
        {block.type === "approvalStampPlaceholder" && (
          <div
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
            }}
          >
            <div style={{ fontWeight: "bold" }}>承認印</div>
            <div style={{ fontSize: "11px" }}>({block.role})</div>
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
