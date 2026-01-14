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
}: any) {
  const isEditable = block.editable !== false && !isReadOnly;
  const borderWidth = block.borderWidth || 1;
  // クリック判定の範囲（枠線 + 4px の透明ヒットエリア）
  const clickThreshold = borderWidth + 4;

  // 隣接判定関数
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

      // 右隣接判定: blockの右端がotherの左端と一致 → blockの右線を消す
      if (bx + bw === ox && by < oy + oh && by + bh > oy) {
        adjacent.right = true;
      }

      // 下隣接判定: blockの下端がotherの上端と一致 → blockの下線を消す
      if (by + bh === oy && bx < ox + ow && bx + bw > ox) {
        adjacent.bottom = true;
      }

      // 注: 左隣接と上隣接の判定は削除
      // 左側の図形の右線だけを消すことで、境界線が1本だけ残る
    });

    return adjacent;
  };

  const adjacent = checkAdjacent();

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
        cursor: isReadOnly ? "default" : (isSelected ? "move" : "default"),
        zIndex: block.zIndex || 100,
        boxSizing: "border-box",
      }}
    >
      {/* 枠線部分のクリック判定レイヤー - 4辺に分割 */}
      {!isReadOnly && !isSelected && (block.type === "rect" || block.type === "circle") && (
        <>
          {/* 上辺 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: Math.min(clickThreshold, block.height / 4),
              borderRadius: block.type === "circle" ? "50% 50% 0 0" : "0",
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: -1,
              background: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
          />
          {/* 右辺 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: Math.min(clickThreshold, block.width / 4),
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: -1,
              background: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
          />
          {/* 下辺 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: Math.min(clickThreshold, block.height / 4),
              borderRadius: block.type === "circle" ? "0 0 50% 50%" : "0",
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: -1,
              background: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
          />
          {/* 左辺 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: Math.min(clickThreshold, block.width / 4),
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: -1,
              background: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
          />
        </>
      )}

      {/* 線（line）のクリック判定レイヤー */}
      {!isReadOnly && !isSelected && block.type === "line" && (
        <div
          style={{
            position: "absolute",
            top: -clickThreshold / 2,
            left: 0,
            right: 0,
            height: borderWidth + clickThreshold,
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: -1,
            background: "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
        />
      )}

      {/* 三角形・矢印用のクリック判定レイヤー（全体） */}
      {!isReadOnly && !isSelected && (block.type === "triangle" || block.type === "arrow") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: -1,
            background: "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
        />
      )}

      {/* テーブル・画像用のクリック判定レイヤー（全体） */}
      {!isReadOnly && !isSelected && (block.type === "table" || block.type === "image") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: -1,
            background: "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            selectBlock(block.id);
          }}
        />
      )}

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: block.type === "rect" || block.type === "circle" ? (block.fillColor || block.backgroundColor || "transparent") : "transparent",
          borderTop:
            block.type === "rect" || block.type === "circle"
              ? adjacent.top ? "none" : `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`
              : "none",
          borderRight:
            block.type === "rect" || block.type === "circle"
              ? adjacent.right ? "none" : `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`
              : "none",
          borderBottom:
            block.type === "rect" || block.type === "circle"
              ? adjacent.bottom ? "none" : `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`
              : "none",
          borderLeft:
            block.type === "rect" || block.type === "circle"
              ? adjacent.left ? "none" : `${block.borderWidth || 1}px solid ${block.borderColor || "#000"}`
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