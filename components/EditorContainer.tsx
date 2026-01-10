"use client";

import { useState } from "react";
import { Rnd } from "react-rnd";

export default function EditorContainer({ blocks, updateBlock, selectBlock }: any) {
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);

  const sizes: any = {
    A4: { w: 794, h: 1123 },
    A3: { w: 1123, h: 1587 },
  };

  const base = sizes[paper];
  const width = orientation === "portrait" ? base.w : base.h;
  const height = orientation === "portrait" ? base.h : base.w;

  return (
    <div className="flex flex-col flex-1 bg-gray-50 p-4 overflow-auto">
      {/* 設定パネル */}
      <div className="flex gap-4 mb-4 items-center bg-white p-3 shadow-sm rounded">
        <select value={paper} onChange={(e) => setPaper(e.target.value)} className="border p-2 rounded">
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>

        <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="border p-2 rounded">
          <option value="portrait">縦</option>
          <option value="landscape">横</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
          グリッド
        </label>

        <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="border p-2 rounded">
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.5}>150%</option>
        </select>
      </div>

      {/* キャンバス */}
      <div className="overflow-auto flex justify-center">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
          <div
            className="relative bg-white shadow-lg"
            style={{
              width,
              height,
              border: "1px solid #ccc",
              backgroundImage: showGrid
                ? `linear-gradient(#e5e5e5 1px, transparent 1px),
                   linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`
                : "none",
              backgroundSize: showGrid ? `40px 40px` : "none",
            }}
          >
            {blocks.map((block: any) => (
              <Rnd
                key={block.id}
                size={{ width: block.width, height: block.height }}
                position={{ x: block.x, y: block.y }}
                bounds="parent"
                disableDragging={block.isEditing}
                enableResizing={!block.isEditing}
                onClick={() => selectBlock(block.id)}
                onDragStop={(e, d) => updateBlock(block.id, { x: d.x, y: d.y })}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  updateBlock(block.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    x: pos.x,
                    y: pos.y,
                  })
                }
              >
                {/* --- テキスト --- */}
                {block.type === "text" && (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full h-full"
                    style={{
                      fontSize: block.fontSize,
                      color: block.color,
                      outline: "none",
                    }}
                    onFocus={() => updateBlock(block.id, { isEditing: true })}
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

                {/* --- 罫線 --- */}
                {block.type === "line" && (
                  <div
                    style={{
                      width: "100%",
                      height: block.borderWidth,
                      backgroundColor: block.borderColor,
                    }}
                  />
                )}

                {/* --- 四角形 --- */}
                {block.type === "rect" && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      border: `${block.borderWidth}px solid ${block.borderColor}`,
                      backgroundColor: block.backgroundColor,
                    }}
                  />
                )}

                {/* --- 丸 --- */}
                {block.type === "circle" && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: `${block.borderWidth}px solid ${block.borderColor}`,
                      backgroundColor: block.backgroundColor,
                    }}
                  />
                )}

                {/* --- 三角形 --- */}
                {block.type === "triangle" && (
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `${block.width / 2}px solid transparent`,
                      borderRight: `${block.width / 2}px solid transparent`,
                      borderBottom: `${block.height}px solid ${block.color}`,
                      transform: `rotate(${block.rotate}deg)`,
                    }}
                  />
                )}

                {/* --- 矢印 --- */}
                {block.type === "arrow" && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transform: `rotate(${block.rotate}deg)`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        width: "100%",
                        height: block.borderWidth,
                        backgroundColor: block.color,
                        transform: "translateY(-50%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        borderTop: `${block.arrowSize}px solid transparent`,
                        borderBottom: `${block.arrowSize}px solid transparent`,
                        borderLeft: `${block.arrowSize * 1.4}px solid ${block.color}`,
                        transform: "translateY(-50%)",
                      }}
                    />
                  </div>
                )}

                {/* --- 表 --- */}
                {block.type === "table" && (
                  <table
                    style={{
                      width: "100%",
                      height: "100%",
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                    }}
                  >
                    <tbody>
                      {block.cells.map((row: any, r: number) => (
                        <tr key={r}>
                          {row.map((cell: any, c: number) => (
                            <td
                              key={c}
                              style={{
                                border: `${block.borderWidth}px solid ${block.borderColor}`,
                                padding: 0,
                                verticalAlign: "top",
                              }}
                            >
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  outline: "none",
                                  padding: "4px",
                                  overflow: "hidden",
                                  wordBreak: "break-all",
                                  fontSize: "12px",
                                }}
                                onFocus={() => updateBlock(block.id, { isEditing: true })}
                                onBlur={(e) => {
                                  const newCells = [...block.cells];
                                  newCells[r] = [...newCells[r]];
                                  newCells[r][c] = { ...newCells[r][c], text: e.currentTarget.innerText };
                                  updateBlock(block.id, { cells: newCells, isEditing: false });
                                }}
                              >
                                {cell.text}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* --- 画像 --- */}
                {block.type === "image" && block.imageUrl && (
                  <img
                    src={block.imageUrl}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    alt=""
                  />
                )}
              </Rnd>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}