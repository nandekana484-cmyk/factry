"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";

export default function TextBlock({
  block,
  isSelected,
  selectedBlock,
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
      dragHandleClassName="editor-text-handle"
      onClick={() => selectBlock(block.id)}
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
      <div
        className="editor-text-handle"
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
          pointerEvents: block.isEditing ? "none" : "auto",
        }}
        onDoubleClick={(e) => {
          if (block.type === "text" || block.type === "titlePlaceholder") {
            e.stopPropagation();
            selectBlock(block.id);
            updateBlock(block.id, { isEditing: true });
            setTimeout(() => {
              const editableDiv = document.querySelector(
                `[data-block-id="${block.id}"] [contenteditable]`
              );
              if (editableDiv) {
                (editableDiv as HTMLElement).focus();
              }
            }, 10);
          }
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: block.isEditing ? "auto" : "none",
        }}
      >
        {/* --- テキスト --- */}
        {block.type === "text" && (
          <div
            contentEditable={isEditable}
            suppressContentEditableWarning
            className="w-full h-full"
            style={{
              fontSize: `${Math.round(block.fontSize || 16)}px`,
              fontWeight: block.fontWeight || "normal",
              fontFamily: block.fontFamily || "sans-serif",
              textAlign: block.textAlign || "left",
              color: block.color,
              outline: "none",
              width: "100%",
              height: "100%",
              pointerEvents: block.isEditing ? "auto" : "none",
            }}
            onFocus={() => {
              if (isEditable) {
                updateBlock(block.id, { isEditing: true });
              }
            }}
            onBlur={(e) =>
              updateBlock(block.id, {
                label: e.currentTarget.innerText,
                isEditing: false,
              })
            }
          >
            {block.label}
          </div>
        )}

        {/* --- タイトルプレースホルダー --- */}
        {block.type === "titlePlaceholder" && (
          <div
            contentEditable={isEditable}
            suppressContentEditableWarning
            className="w-full h-full"
            style={{
              fontSize: `${Math.round(block.fontSize || 20)}px`,
              fontWeight: block.fontWeight || "bold",
              fontFamily: block.fontFamily || "sans-serif",
              textAlign: block.textAlign || "left",
              color: block.color || "#000000",
              outline: "none",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                block.textAlign === "center"
                  ? "center"
                  : block.textAlign === "right"
                    ? "flex-end"
                    : "flex-start",
              padding: "8px",
              pointerEvents: block.isEditing ? "auto" : "none",
            }}
            onFocus={() => {
              if (isEditable) {
                updateBlock(block.id, { isEditing: true });
              }
            }}
            onBlur={(e) =>
              updateBlock(block.id, {
                value: e.currentTarget.innerText,
                isEditing: false,
              })
            }
          >
            {block.value || "タイトル"}
          </div>
        )}
      </div>
    </Rnd>
  );
}
