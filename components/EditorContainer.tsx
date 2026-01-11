"use client";

import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";

export default function EditorContainer({ blocks, selectedBlock, updateBlock, selectBlock, deleteBlock, selectedCell, setSelectedCell, onSaveTemplate, onNewTemplate }: any) {
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [gridSize, setGridSize] = useState(20);
  const [snapMode, setSnapMode] = useState(true);
  const rndRefs = useRef<{ [key: string]: any }>({});

  // Deleteキーでブロック削除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedBlock) {
        e.preventDefault();
        deleteBlock(selectedBlock.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlock, deleteBlock]);

  const sizes: any = {
    A4: { w: 794, h: 1123 },
    A3: { w: 1123, h: 1587 },
  };

  const base = sizes[paper];
  const width = orientation === "portrait" ? base.w : base.h;
  const height = orientation === "portrait" ? base.h : base.w;

  // 要件1・2: スナップ関数: 座標とサイズを gridSize 単位に丸める（必ず整数を返す）
  const snap = (value: number, size: number = gridSize): number => {
    const rounded = Math.round(value); // 最初に整数に丸める
    if (!snapMode) {
      return rounded; // snapMode OFF でも整数化
    }
    // snapMode ON: gridSize 単位で丸める
    return Math.round(rounded / size) * size;
  };

  // 要件4: グリッドのセンター割り計算（整数に丸める）
  const offsetX = Math.round((width / 2) % gridSize);
  const offsetY = Math.round((height / 2) % gridSize);

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
          <option value="landlandscape">横</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
          グリッド
        </label>

        <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="border p-2 rounded">
          <option value={10}>10px</option>
          <option value={20}>20px</option>
          <option value={40}>40px</option>
          <option value={80}>80px</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={snapMode} onChange={() => setSnapMode(!snapMode)} />
          スナップ
        </label>

        <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="border p-2 rounded">
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.5}>150%</option>
        </select>

        <button
          onClick={onNewTemplate}
          className="ml-auto px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition font-medium"
        >
          新規作成
        </button>

        <button
          onClick={onSaveTemplate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-medium"
        >
          保存
        </button>
      </div>

      {/* キャンバス */}
      <div className="overflow-auto flex justify-center">
        {/* 要件3: transformOrigin を "top left" に変更してズレを防ぐ */}
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", willChange: "transform" }}>
          {/* 要件4, 5: グリッド背景を整数化して設定 */}
          <div
            className="relative bg-white shadow-lg"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              border: "1px solid #ccc",
              backgroundImage: showGrid
                ? `linear-gradient(#e5e5e5 1px, transparent 1px),
                   linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`
                : "none",
              backgroundSize: showGrid ? `${Math.round(gridSize)}px ${Math.round(gridSize)}px` : "none",
              backgroundPosition: showGrid ? `${offsetX}px ${offsetY}px` : "none",
              backgroundAttachment: "local",
            }}
          >
            {blocks.map((block: any) => {
              const shouldRotate = ["rect", "circle", "triangle", "arrow", "image", "text", "line"].includes(block.type);
              const rotation = shouldRotate ? block.rotate || 0 : 0;
              const isSelected = selectedBlock?.id === block.id;
              const isEditable = block.editable !== false; // デフォルトは editable

              return (
                <Rnd
                  key={block.id}
                  data-block-id={block.id}
                  ref={(ref) => {
                    if (ref) rndRefs.current[block.id] = ref;
                  }}
                  size={{ 
                    width: Math.round(block.width), 
                    height: Math.round(block.height) 
                  }}
                  position={{ 
                    x: Math.round(block.x), 
                    y: Math.round(block.y) 
                  }}
                  bounds="parent"
                  disableDragging={!isEditable || !isSelected || block.isEditing}
                  enableResizing={isEditable && isSelected && !block.isEditing}
                  dragHandleClassName="drag-handle"
                  onClick={() => selectBlock(block.id)}
                  // 要件1, 2, 6: ドラッグ時に座標を完全に整数化
                  onDragStop={(e, d) => {
                    const newX = snap(Math.round(d.x));
                    const newY = snap(Math.round(d.y));
                    updateBlock(block.id, { x: newX, y: newY });
                  }}
                  // 要件1, 2, 6: リサイズ時に座標とサイズを完全に整数化
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
                    className="editor-selected-border drag-handle"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: isSelected
                        ? "2px solid #4A90E2"
                        : "2px solid transparent",
                      boxSizing: "border-box",
                      pointerEvents: block.type === "text" && block.isEditing ? "none" : (isSelected ? "auto" : "none"),
                      cursor: isSelected ? "move" : "default",
                      zIndex: 10,
                    }}
                    onDoubleClick={(e) => {
                      if ((block.type === "text" || block.type === "titlePlaceholder") && isSelected) {
                        e.stopPropagation();
                        updateBlock(block.id, { isEditing: true });
                        setTimeout(() => {
                          const editableDiv = document.querySelector(`[data-block-id="${block.id}"] [contenteditable]`);
                          if (editableDiv) {
                            (editableDiv as HTMLElement).focus();
                          }
                        }, 0);
                      }
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      pointerEvents: (block.type === "text" || block.type === "titlePlaceholder") ? "auto" : "none",
                    }}
                    onDoubleClick={(e) => {
                      if ((block.type === "text" || block.type === "titlePlaceholder") && isSelected) {
                        e.stopPropagation();
                        const target = e.currentTarget as HTMLElement;
                        updateBlock(block.id, { isEditing: true });
                        // フォーカスを設定
                        setTimeout(() => {
                          const editableDiv = target.querySelector('[contenteditable]');
                          if (editableDiv) {
                            (editableDiv as HTMLElement).focus();
                          }
                        }, 0);
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                        pointerEvents: (block.type === "text" || block.type === "titlePlaceholder") && !block.isEditing ? "auto" : "none",
                      }}
                    >
                    {/* --- テキスト --- */}
                    {block.type === "text" && (
                      <div
                        contentEditable={block.editable !== false}
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
                          pointerEvents: block.isEditing ? "auto" : "none", // 編集時のみ有効化
                        }}
                        onFocus={() => {
                          if (block.editable !== false) {
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

                {/* --- 罫線 --- */}
                {block.type === "line" && (
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.round(block.borderWidth || 1)}px`,
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
                      border: `${Math.round(block.borderWidth || 1)}px solid ${block.borderColor}`,
                      backgroundColor: block.backgroundColor,
                      boxSizing: "border-box",
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
                      border: `${Math.round(block.borderWidth || 1)}px solid ${block.borderColor}`,
                      backgroundColor: block.backgroundColor,
                      boxSizing: "border-box",
                    }}
                  />
                )}

                {/* --- 三角形 --- */}
                {block.type === "triangle" && (
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${Math.round(block.width)} ${Math.round(block.height)}`}
                  >
                    <polygon
                      points={`${Math.round(block.width / 2)},0 ${Math.round(block.width)},${Math.round(block.height)} 0,${Math.round(block.height)}`}
                      fill="none"
                      stroke={block.borderColor || "#000000"}
                      strokeWidth={Math.round(block.borderWidth || 1)}
                    />
                  </svg>
                )}

                {/* --- 矢印 --- */}
                {block.type === "arrow" && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        width: "100%",
                        height: `${Math.round(block.borderWidth || 1)}px`,
                        backgroundColor: block.borderColor || block.color || "#000000",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        borderTop: `${Math.round(block.arrowSize || 10)}px solid transparent`,
                        borderBottom: `${Math.round(block.arrowSize || 10)}px solid transparent`,
                        borderLeft: `${Math.round((block.arrowSize || 10) * 1.4)}px solid ${block.borderColor || block.color || "#000000"}`,
                        transform: "translateY(-50%)",
                      }}
                    />
                  </div>
                )}

                {/* --- 表 --- */}
                {block.type === "table" && (
                  <table
                    style={{
                      width: `${Math.round(block.width)}px`,
                      height: `${Math.round(block.height)}px`,
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                      pointerEvents: "auto", // 表全体をクリック可能に
                    }}
                  >
                    <tbody>
                      {block.cells.map((row: any, r: number) => (
                        <tr key={r}>
                          {row.map((cell: any, c: number) => (
                            <td
                              key={c}
                              onClick={() => {
                                selectBlock(block.id);
                                setSelectedCell({ row: r, col: c });
                              }}
                              style={{
                                width: `${Math.round(cell.width || 50)}px`,
                                height: `${Math.round(cell.height || 30)}px`,
                                border: `${Math.round(block.borderWidth || 1)}px solid ${block.borderColor}`,
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
                                  fontSize: `${Math.round(cell.fontSize || 12)}px`,
                                  fontWeight: cell.fontWeight || "normal",
                                  color: cell.color || "#000000",
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
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "contain",
                      display: "block",
                    }}
                    alt=""
                  />
                )}

                {/* --- 承認印プレースホルダー --- */}
                {block.type === "approvalStampPlaceholder" && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      border: `${Math.round(block.borderWidth || 2)}px dashed ${block.borderColor || "#999999"}`,
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
                      border: `${Math.round(block.borderWidth || 1)}px solid ${block.borderColor || "#666666"}`,
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
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>管理番号</div>
                  </div>
                )}

                {/* --- タイトルプレースホルダー --- */}
                {block.type === "titlePlaceholder" && (
                  <div
                    contentEditable={block.editable !== false}
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
                      justifyContent: block.textAlign === "center" ? "center" : (block.textAlign === "right" ? "flex-end" : "flex-start"),
                      padding: "8px",
                      pointerEvents: block.isEditing ? "auto" : "none",
                    }}
                    onFocus={() => {
                      if (block.editable !== false) {
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
                  </div>
                </Rnd>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}