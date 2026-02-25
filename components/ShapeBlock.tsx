"use client";

import { Rnd } from "react-rnd";
import React, { useMemo } from "react";

function ShapeBlockComponent({
  block,
  blocks = [],
  isSelected,
  updateBlock,
  selectBlock,
  snap,
  isReadOnly = false,
  onDoubleClick,
}: any) {
  const borderWidth = block.borderWidth || 1;

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

  /** snap が number を返す前提で x,y / w,h をスナップ */
  const applySnapXY = (x: number, y: number) => {
    if (!snap) return { x, y };
    return { x: snap(x), y: snap(y) };
  };

  const applySnapSize = (w: number, h: number) => {
    if (!snap) return { w, h };
    return { w: snap(w), h: snap(h) };
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
    onDoubleClick?.();
  };

  return (
    <Rnd
      data-block-id={block.id}
      size={size}
      position={position}
      bounds="parent"
      disableDragging={isReadOnly || !isSelected}
      enableResizing={isReadOnly ? false : isSelected}
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
      onMouseDown={(e: any) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        outline: isReadOnly
          ? "none"
          : isSelected
          ? "3px solid #4A90E2"
          : "none",
        outlineOffset: "0px",
        cursor: isReadOnly ? "default" : isSelected ? "move" : "default",
        zIndex: block.zIndex || 100,
        boxSizing: "border-box",
      }}
    >
      {/* 実体描画 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor:
            block.type === "rect" || block.type === "circle"
              ? block.fillColor || block.backgroundColor || "transparent"
              : "transparent",
          border:
            block.type === "rect" || block.type === "circle"
              ? `${block.borderWidth || 1}px solid ${
                  block.borderColor || "#000"
                }`
              : "none",
          borderRadius: block.type === "circle" ? "50%" : "0",
          boxSizing: "border-box",
          pointerEvents: "none",
          position: "relative",
        }}
      >
        {/* 線 */}
        {block.type === "line" && (
          <div
            style={{
              width: "100%",
              height: `${block.borderWidth || 1}px`,
              backgroundColor: block.borderColor || "#000",
              pointerEvents: "none",
            }}
          />
        )}

        {/* 三角形 */}
        {block.type === "triangle" && (
          <svg
            width={block.width}
            height={block.height}
            style={{
              display: "block",
              pointerEvents: "none",
              width: "100%",
              height: "100%",
              overflow: "visible",
            }}
            viewBox={`0 0 ${block.width} ${block.height}`}
          >
            <path
              d={`M ${block.width / 2} 0 L ${block.width} ${block.height} L 0 ${block.height} Z`}
              fill={block.fillColor || block.backgroundColor || "transparent"}
              stroke={block.borderColor || "#000"}
              strokeWidth={block.borderWidth || 2}
            />
          </svg>
        )}

        {/* 矢印 */}
        {block.type === "arrow" && (
          <svg
            width="100%"
            height="100%"
            style={{ display: "block", pointerEvents: "none" }}
          >
            <defs>
              <marker
                id={`arrowhead-${block.id}`}
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill={block.borderColor || "#000"}
                />
              </marker>
            </defs>
            <line
              x1="0"
              y1={block.height / 2}
              x2={block.width}
              y2={block.height / 2}
              stroke={block.borderColor || "#000"}
              strokeWidth={block.borderWidth || 4}
              markerEnd={`url(#arrowhead-${block.id})`}
            />
          </svg>
        )}

        {/* 表 */}
        {block.type === "table" && (
          <table
            style={{
              width: "100%",
              height: "100%",
              borderCollapse: "collapse",
              pointerEvents: "none",
            }}
          >
            <tbody>
              {Array.isArray(block.cells) &&
                block.cells.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, colIndex: number) => (
                      <td
                        key={colIndex}
                        style={{
                          border: `${block.borderWidth || 1}px solid ${
                            block.borderColor || "#000"
                          }`,
                          padding: "4px",
                          fontSize: `${cell.fontSize || 12}px`,
                          fontWeight: cell.fontWeight || "normal",
                          color: cell.color || "#000",
                          textAlign: "left",
                        }}
                      >
                        {cell.text || ""}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* 画像 */}
        {block.type === "image" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              pointerEvents: "none",
            }}
          >
            {block.src ? (
              <img
                src={block.src}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
                alt=""
              />
            ) : (
              <span style={{ color: "#999", fontSize: "14px" }}>画像</span>
            )}
          </div>
        )}
      </div>
    </Rnd>
  );
}

/** React.memo で再レンダー最適化 */
export default React.memo(ShapeBlockComponent);