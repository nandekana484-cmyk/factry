"use client";

import { Rnd } from "react-rnd";
import React, { useMemo } from "react";

interface TextBlockProps {
  block: any;
  isSelected: boolean;
  selectedBlock: any;
  updateBlock: (id: string, updates: any) => void;
  selectBlock: (id: string | null) => void;
  snap?: (x: number, y: number) => { x: number; y: number };
  isReadOnly?: boolean;
  isTextEditable?: boolean;
  onDoubleClick?: () => void;
}

function TextBlockComponent({
  block,
  isSelected,
  selectedBlock,
  updateBlock,
  selectBlock,
  snap,
  isReadOnly = false,
  isTextEditable = true,
  onDoubleClick,
}: TextBlockProps) {
  const canEditText = isTextEditable && block.editable !== false;
  const canMoveResize = !isReadOnly;

  /** ------------------------------
   *  Rnd の size / position を useMemo で安定化
   * ------------------------------ */
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

  const applySnap = (x: number, y: number) => {
    if (snap) return snap(x, y);
    return { x, y };
  };

  return (
    <Rnd
      // ❌ key={block.id} は絶対に付けない（再生成されて snap が壊れる）
      size={size}
      position={position}
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
      data-block-id={block.id}
      onMouseDown={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onDragStop={(e, d) => {
        if (isReadOnly) return;
        const snapped = applySnap(d.x, d.y);
        updateBlock(block.id, { x: snapped.x, y: snapped.y });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        if (isReadOnly) return;

        const parsedWidth = parseFloat(ref.style.width) || block.width;
        const parsedHeight = parseFloat(ref.style.height) || block.height;

        const snappedPos = applySnap(pos.x, pos.y);
        const snappedSize = applySnap(parsedWidth, parsedHeight);

        updateBlock(block.id, {
          width: snappedSize.x,
          height: snappedSize.y,
          x: snappedPos.x,
          y: snappedPos.y,
        });
      }}
    >
      {/* 選択枠 */}
      <div
        className="editor-text-frame"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          outline: canMoveResize
            ? isSelected
              ? "3px solid #4A90E2"
              : "1px dashed #cccccc"
            : "none",
          outlineOffset: "0px",
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />

      {/* ダブルクリックで編集モード */}
      {canMoveResize && !block.isEditing && (
        <div
          className="editor-text-handle"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: isSelected ? "move" : "default",
            zIndex: 200,
            pointerEvents: "auto",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
            updateBlock(block.id, { isEditing: true });
            onDoubleClick?.();
          }}
        />
      )}

      {/* テキスト本体 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: block.isEditing ? "auto" : "none",
          zIndex: 50,
          position: "relative",
        }}
      >
        {block.type === "text" && (
          <div
            contentEditable={canEditText && block.isEditing}
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
              cursor: canEditText ? "text" : "default",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              padding: "4px",
            }}
            onBlur={(e) =>
              updateBlock(block.id, {
                label: e.currentTarget.innerText,
                value: e.currentTarget.innerText,
                isEditing: false,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") e.stopPropagation();
            }}
          >
            {block.label ?? block.value ?? ""}
          </div>
        )}
      </div>
    </Rnd>
  );
}

/** ------------------------------
 *  React.memo で再レンダー最適化
 * ------------------------------ */
export default React.memo(TextBlockComponent);