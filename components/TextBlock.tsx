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
  isReadOnly = false,
  isTextEditable = true,
}: any) {
  // isReadOnly: ドラッグ・リサイズの可否を制御
  // isTextEditable: テキスト入力の可否を制御
  // この2つは完全に独立している
  const canEditText = isTextEditable && block.editable !== false;
  const canMoveResize = !isReadOnly;

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
      disableDragging={isReadOnly || !isSelected || block.isEditing}
      enableResizing={
        isReadOnly
          ? false
          : isSelected && !block.isEditing
          ? {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }
          : false
      }
      dragHandleClassName="editor-text-handle"
      style={{
        zIndex: block.zIndex || 1500,
        boxSizing: "border-box",
      }}
      onClick={(e: any) => {
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
    >
      {/* 編集用枠線ガイド（印刷時は非表示） */}
      <div
        className="editor-text-frame"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          outline: canMoveResize
            ? (isSelected 
              ? "3px solid #4A90E2" 
              : "1px dashed #cccccc")
            : "none",
          outlineOffset: "0px",
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />

      {/* ドラッグハンドル（透明） - 編集中は非表示、それ以外で移動可能なときは表示 */}
      {canMoveResize && !block.isEditing && (
        <div
          className="editor-text-handle"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            boxSizing: "border-box",
            cursor: isSelected ? "move" : "default",
            zIndex: 200,
            pointerEvents: "auto",
          }}
          onDoubleClick={(e) => {
            if (canEditText && (block.type === "text" || block.type === "titlePlaceholder")) {
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
      )}

      <div
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: block.isEditing ? "auto" : "none",
          zIndex: 50,
          position: "relative",
        }}
      >
        {/* --- テキスト --- */}
        {block.type === "text" && (
          <div
            contentEditable={canEditText}
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
              pointerEvents: canEditText ? "auto" : "none",
              cursor: canEditText ? "text" : "default",
            }}
            onFocus={() => {
              if (canEditText) {
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
            contentEditable={canEditText}
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
              pointerEvents: canEditText ? "auto" : "none",
              cursor: canEditText ? "text" : "default",
            }}
            onFocus={() => {
              if (canEditText) {
                updateBlock(block.id, { isEditing: true });
              }
            }}
            onBlur={(e) => {
              // 編集終了時に全ページのタイトルを同期
              updateBlock(block.id, {
                value: e.currentTarget.innerText,
                isEditing: false,
              });
            }}
          >
            {block.value || "タイトル"}
          </div>
        )}
      </div>
    </Rnd>
  );
}
