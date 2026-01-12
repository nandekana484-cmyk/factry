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
        width: Math.round(block.width),
        height: Math.round(block.height),
      }}
      position={{
        x: Math.round(block.x),
        y: Math.round(block.y),
      }}
      bounds="parent"
      disableDragging={false}
      enableResizing={isSelected}
      onMouseDown={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
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
      style={{
        border: isSelected ? "2px solid #4A90E2" : "2px solid transparent",
        cursor: "move",
        zIndex: isSelected ? 1000 : 1,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: block.type === "rect" || block.type === "circle" ? (block.backgroundColor || "transparent") : "transparent",
          border:
            block.type === "rect" || block.type === "circle"
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
              fill={block.backgroundColor || "transparent"}
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
        {block.type === "image" && block.imageUrl && (
          <img
            src={block.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              pointerEvents: "none",
            }}
            alt=""
          />
        )}
      </div>
    </Rnd>
  );
}