"use client";

import { useState, useRef, useEffect } from "react";
import ImageCropModal from "./ImageCropModal";

interface WriterPropertyBoxProps {
  selectedBlock: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onClose: () => void;
}

export default function WriterPropertyBox({
  selectedBlock,
  onUpdateBlock,
  onClose,
}: WriterPropertyBoxProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCropModal, setShowCropModal] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.property-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // ドラッグ中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!selectedBlock) {
    return (
      <div
        ref={boxRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
        }}
        className="bg-white rounded-lg shadow-xl border border-gray-300 w-80"
        data-ignore-deselect="true"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="property-header bg-blue-500 text-white px-4 py-3 rounded-t-lg cursor-move flex justify-between items-center"
          onMouseDown={handleMouseDown}
        >
          <h3 className="font-bold">プロパティ</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4 text-gray-500 text-center">
          ブロックを選択してください
        </div>
      </div>
    );
  }

  const isTextBlock = ["text", "titlePlaceholder", "subtitlePlaceholder"].includes(selectedBlock.type);
  const isShapeBlock = ["rect", "circle", "triangle", "arrow", "line"].includes(selectedBlock.type);
  const isTableBlock = selectedBlock.type === "table";
  const isImageBlock = selectedBlock.type === "image";

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-300 w-80"
      data-ignore-deselect="true"
      onMouseDown={(e) => {
        e.stopPropagation();
        handleMouseDown(e);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ヘッダー */}
      <div
        className="property-header bg-blue-500 text-white px-4 py-3 rounded-t-lg cursor-move flex justify-between items-center"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-bold">プロパティ</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* プロパティ編集エリア */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* ブロック情報 */}
        <div className="pb-3 border-b">
          <p className="text-sm text-gray-600">
            タイプ: <span className="font-semibold">{selectedBlock.type}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">ID: {selectedBlock.id}</p>
        </div>

        {/* テキストブロック用 */}
        {isTextBlock && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                テキスト
              </label>
              <textarea
                value={selectedBlock.label || selectedBlock.value || ""}
                onChange={(e) =>
                  onUpdateBlock(selectedBlock.id, {
                    [selectedBlock.label !== undefined ? "label" : "value"]: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                フォントサイズ
              </label>
              <input
                type="number"
                value={selectedBlock.fontSize || 16}
                onChange={(e) =>
                  onUpdateBlock(selectedBlock.id, {
                    fontSize: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文字色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBlock.color || "#000000"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, {
                      color: e.target.value,
                    })
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.color || "#000000"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, {
                      color: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {/* 図形ブロック用 */}
        {isShapeBlock && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                幅
              </label>
              <input
                type="number"
                value={Math.round(selectedBlock.width || 0)}
                onChange={(e) =>
                  onUpdateBlock(selectedBlock.id, {
                    width: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={selectedBlock.isTemplateBlock}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                高さ
              </label>
              <input
                type="number"
                value={Math.round(selectedBlock.height || 0)}
                onChange={(e) =>
                  onUpdateBlock(selectedBlock.id, {
                    height: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={selectedBlock.isTemplateBlock}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                塗りつぶし
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBlock.fillColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, {
                      fillColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  disabled={selectedBlock.isTemplateBlock}
                />
                <input
                  type="text"
                  value={selectedBlock.fillColor || "#ffffff"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, {
                      fillColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedBlock.isTemplateBlock}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                枠線の色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBlock.borderColor || "#000000"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, {
                      borderColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  disabled={selectedBlock.isTemplateBlock}
                />
                <input
                  type="text"
                  value={selectedBlock.borderColor || "#000000"}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, {
                      borderColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedBlock.isTemplateBlock}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                枠線の太さ
              </label>
              <input
                type="number"
                value={selectedBlock.borderWidth || 1}
                onChange={(e) =>
                  onUpdateBlock(selectedBlock.id, {
                    borderWidth: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={selectedBlock.isTemplateBlock}
              />
            </div>
          </>
        )}

        {/* 共通プロパティ */}
        <div className="pt-3 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X座標
            </label>
            <input
              type="number"
              value={Math.round(selectedBlock.x || 0)}
              onChange={(e) =>
                onUpdateBlock(selectedBlock.id, {
                  x: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={selectedBlock.isTemplateBlock}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y座標
            </label>
            <input
              type="number"
              value={Math.round(selectedBlock.y || 0)}
              onChange={(e) =>
                onUpdateBlock(selectedBlock.id, {
                  y: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={selectedBlock.isTemplateBlock}
            />
          </div>
        </div>

        {/* 画像ブロック用 */}
        {isImageBlock && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                画像
              </label>
              
              {/* 現在の画像プレビュー */}
              {selectedBlock.src && (
                <div className="mb-3 border rounded p-2 bg-gray-50">
                  <img
                    src={selectedBlock.src}
                    alt="プレビュー"
                    className="w-full h-32 object-contain"
                  />
                </div>
              )}
              
              {/* 画像変更ボタン */}
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
              >
                {selectedBlock.src ? "画像を変更" : "画像を選択"}
              </button>
              
              {/* トリミングボタン */}
              {selectedBlock.src && (
                <button
                  onClick={() => setShowCropModal(true)}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm font-medium mt-2"
                >
                  トリミング
                </button>
              )}
              
              {/* 非表示のファイル入力 */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    alert("画像ファイルを選択してください");
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageData = event.target?.result as string;
                    if (imageData) {
                      onUpdateBlock(selectedBlock.id, { src: imageData });
                    }
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>
          </div>
        )}

        {selectedBlock.isTemplateBlock && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            ⚠️ テンプレート由来のブロックは移動・サイズ変更できません
          </div>
        )}
      </div>

      {/* トリミングモーダル */}
      {showCropModal && selectedBlock.src && (
        <ImageCropModal
          imageSrc={selectedBlock.src}
          onComplete={(croppedImage) => {
            onUpdateBlock(selectedBlock.id, { src: croppedImage });
            setShowCropModal(false);
          }}
          onCancel={() => setShowCropModal(false)}
        />
      )}
    </div>
  );
}
