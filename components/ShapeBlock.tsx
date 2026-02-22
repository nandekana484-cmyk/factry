"use client";

import { Rnd } from "react-rnd";

export default function ShapeBlock({
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
  const clickThreshold = borderWidth + 4;

  const checkAdjacent = () => {
    if (block.type !== "rect" && block.type !== "circle") {
      return { top: false, right: false, bottom: false, left: false };
    }

    const adjacent = { top: false, right: false, bottom: false, left: false };

    blocks.forEach((other: any) => {
      if (other.id === block.id) return;
      if (other.type !== "rect" && other.type !== "circle") return;

      const bx = Math.round(block.x);
      const by = Math.round(block.y);
      const bw = Math.round(block.width);
      const bh = Math.round(block.height);
      const ox = Math.round(other.x);
      const oy = Math.round(other.y);
      const ow = Math.round(other.width);
      const oh = Math.round(other.height);

      if (bx + bw === ox && by < oy + oh && by + bh > oy) {
        adjacent.right = true;
      }

      if (by + bh === oy && bx < ox + ow && bx + bw > ox) {
        adjacent.bottom = true;
      }
    });

    return adjacent;
  };

  const adjacent = checkAdjacent();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
    onDoubleClick?.();
  };

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
      disableDragging={isReadOnly || !isSelected}
      enableResizing={isReadOnly ? false : isSelected}
      onDragStop={(e, d) => {
        if (isReadOnly) return;
        const snapped = snap(d.x, d.y);
        updateBlock(block.id, { x: snapped.x, y: snapped.y });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        if (isReadOnly) return;
        const parsedWidth = parseFloat(ref.style.width) || block.width;
        const parsedHeight = parseFloat(ref.style.height) || block.height;

        const snappedSize = snap(parsedWidth, parsedHeight);
        const snappedPos = snap(pos.x, pos.y);

        updateBlock(block.id, {
          width: snappedSize.x,
          height: snappedSize.y,
          x: snappedPos.x,
          y: snappedPos.y,
        });
      }}
      onMouseDown={(e: any) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onDoubleClick={handleDoubleClick}   // ★ ダブルクリックはここだけ
      style={{
        outline: isReadOnly ? "none" : isSelected ? "3px solid #4A90E2" : "none",
        outlineOffset: "0px",
        cursor: isReadOnly ? "default" : isSelected ? "move" : "default",
        zIndex: block.zIndex || 100,
        boxSizing: "border-box",
      }}
    >
      {/* 透明クリックレイヤー（選択のみ） */}
      {!isReadOnly && !isSelected && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: -1,
            background: "transparent",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
        />
      )}

      {/* 実体描画 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor:
            block.type === "rect" || block.type === "circle"
              ? block.fillColor || block.backgroundColor || "transparent"
              : "transparent",
          border: block.type === "rect" || block.type === "circle"
            ? `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`
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
            style={{ display: "block", pointerEvents: "none", width: "100%", height: "100%", overflow: "visible" }}
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
          <svg width="100%" height="100%" style={{ display: "block", pointerEvents: "none" }}>
            <defs>
              <marker
                id={`arrowhead-${block.id}`}
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill={block.borderColor || "#000"} />
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
                          border: `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`,
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
              border: "none",
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