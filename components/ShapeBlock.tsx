"use client";

import { Rnd } from "react-rnd";

export default function ShapeBlock({
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
        width: block.width,
        height: block.height,
      }}
      position={{
        x: block.x,
        y: block.y,
      }}
      bounds="parent"
      disableDragging={!isEditable || !isSelected}
      enableResizing={isEditable && isSelected}
      style={{
        zIndex: isSelected ? 1000 : 1,
        border: isSelected ? "2px solid #4A90E2" : "1px solid transparent",
        boxSizing: "border-box",
      }}
      onMouseDown={() => selectBlock(block.id)}
      onDragStart={() => selectBlock(block.id)}
      onResizeStart={() => selectBlock(block.id)}
      onDragStop={(e, d) => {
        updateBlock(block.id, {
          x: snap(d.x),
          y: snap(d.y),
        });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        updateBlock(block.id, {
          width: snap(parseFloat(ref.style.width)),
          height: snap(parseFloat(ref.style.height)),
          x: snap(pos.x),
          y: snap(pos.y),
        });
      }}
    >
      {/* 図形本体 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: block.backgroundColor || "transparent",
          border:
            block.type !== "line"
              ? `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`
              : "none",
          borderRadius: block.type === "circle" ? "50%" : "0",
          boxSizing: "border-box",
        }}
      >
        {/* 線 */}
        {block.type === "line" && (
          <div
            style={{
              width: "100%",
              height: `${block.borderWidth || 1}px`,
              backgroundColor: block.borderColor || "#000",
            }}
          />
        )}

        {/* 画像 */}
        {block.type === "image" && block.imageUrl && (
          <img
            src={block.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
            alt=""
          />
        )}
      </div>
    </Rnd>
  );
}