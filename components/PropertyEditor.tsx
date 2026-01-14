"use client";

import { useRef, useState } from "react";
import ImageCropModal from "./ImageCropModal";

interface PropertyEditorProps {
  block: any;
  onUpdate: (id: string, updated: any) => void;
  selectedCell?: { row: number; col: number } | null;
  onSelectCell?: (cell: { row: number; col: number } | null) => void;
}

export default function PropertyEditor({
  block,
  onUpdate,
  selectedCell,
  onSelectCell,
}: PropertyEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  if (!block) {
    return (
      <div className="h-full bg-white text-gray-400 text-sm overflow-y-auto">
        ブロックを選択してください
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdate(block.id, { [key]: value });
  };

  // 画像選択ハンドラー
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        onUpdate(block.id, { src: imageData });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // --- テーブル操作用関数 ---
  const addRow = () => {
    const newCols = block.cols;
    const newRow = Array.from({ length: newCols }).map(() => ({
      text: "",
      width: 80,
      height: 30,
    }));
    onUpdate(block.id, {
      rows: block.rows + 1,
      cells: [...block.cells, newRow],
    });
  };

  const addCol = () => {
    const newCells = block.cells.map((row: any) => [
      ...row,
      { text: "", width: 80, height: 30 },
    ]);
    onUpdate(block.id, {
      cols: block.cols + 1,
      cells: newCells,
    });
  };

  // --- セル編集用 ---
  const updateCell = (key: string, value: any) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const newCells = [...block.cells];
    newCells[row] = [...newCells[row]];
    newCells[row][col] = { ...newCells[row][col], [key]: value };

    onUpdate(block.id, { cells: newCells });
  };

  // --- rows/cols 変更関数 ---
  const handleRowsChange = (newRows: number) => {
    let newCells = [...block.cells];
    
    if (newRows > block.rows) {
      // 行を追加
      const newCols = block.cols;
      for (let i = block.rows; i < newRows; i++) {
        const newRow = Array.from({ length: newCols }).map(() => ({
          text: "",
          fontSize: 12,
          fontWeight: "normal",
          color: "#000000",
          width: 80,
          height: 30,
        }));
        newCells.push(newRow);
      }
    } else if (newRows < block.rows) {
      // 行を削除
      newCells = newCells.slice(0, newRows);
    }
    
    onUpdate(block.id, { rows: newRows, cells: newCells });
  };

  const handleColsChange = (newCols: number) => {
    let newCells = block.cells.map((row: any) => [...row]);
    
    if (newCols > block.cols) {
      // 列を追加
      newCells = newCells.map((row: any) => [
        ...row,
        ...Array.from({ length: newCols - block.cols }).map(() => ({
          text: "",
          fontSize: 12,
          fontWeight: "normal",
          color: "#000000",
          width: 80,
          height: 30,
        })),
      ]);
    } else if (newCols < block.cols) {
      // 列を削除
      newCells = newCells.map((row: any) => row.slice(0, newCols));
    }
    
    onUpdate(block.id, { cols: newCols, cells: newCells });
  };

  return (
    <div className="h-full bg-white overflow-y-auto">
      <h3 className="font-bold text-gray-700">プロパティ</h3>

      <div>
        {/* 基本座標 */}
        <div>
          <label className="block text-xs text-gray-500">位置 (X, Y)</label>
          <div className="flex">
            <input
              type="number"
              value={Math.round(block.x)}
              onChange={(e) => handleChange("x", Number(e.target.value))}
              className="w-full border rounded text-sm"
            />
            <input
              type="number"
              value={Math.round(block.y)}
              onChange={(e) => handleChange("y", Number(e.target.value))}
              className="w-full border rounded text-sm"
            />
          </div>
        </div>

        {/* サイズ */}
        <div>
          <label className="block text-xs text-gray-500">サイズ (W, H)</label>
          <div className="flex">
            <input
              type="number"
              value={Math.round(block.width)}
              onChange={(e) => handleChange("width", Number(e.target.value))}
              className="w-full border rounded text-sm"
            />
            <input
              type="number"
              value={Math.round(block.height)}
              onChange={(e) => handleChange("height", Number(e.target.value))}
              className="w-full border rounded text-sm"
            />
          </div>
        </div>

        {/* 回転 */}
        <div>
          <label className="block text-xs text-gray-500">回転 (deg)</label>
          <input
            type="number"
            value={Math.round(block.rotate || 0)}
            onChange={(e) => handleChange("rotate", Number(e.target.value))}
            className="w-full border rounded text-sm"
          />
        </div>

        {/* テキスト専用：フォント・サイズ・太さ・色 */}
        {(block.type === "text" || block.type === "titlePlaceholder" || block.type === "subtitlePlaceholder") && (
          <>
            <div>
              <label className="block text-xs text-gray-500">文字色</label>
              <input
                type="color"
                value={block.color || "#000000"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500">フォント</label>
              <select
                value={block.fontFamily || "sans-serif"}
                onChange={(e) => handleChange("fontFamily", e.target.value)}
                className="w-full border rounded text-sm"
              >
                <option value="sans-serif">サンセリフ（デフォルト）</option>
                <option value="serif">セリフ</option>
                <option value="monospace">等幅フォント</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500">フォントサイズ</label>
              <input
                type="number"
                value={block.fontSize || 16}
                onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                className="w-full border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500">フォント太さ</label>
              <select
                value={block.fontWeight || "normal"}
                onChange={(e) => handleChange("fontWeight", e.target.value)}
                className="w-full border rounded text-sm"
              >
                <option value="normal">通常</option>
                <option value="bold">太字</option>
                <option value="lighter">細字</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500">テキスト配置</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange("textAlign", "left")}
                  className={`flex-1 py-2 px-2 border rounded text-sm transition ${
                    (block.textAlign || "left") === "left"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                  title="左寄せ"
                >
                  ⬅
                </button>
                <button
                  onClick={() => handleChange("textAlign", "center")}
                  className={`flex-1 py-2 px-2 border rounded text-sm transition ${
                    (block.textAlign || "left") === "center"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                  title="中央"
                >
                  ⬇⬆
                </button>
                <button
                  onClick={() => handleChange("textAlign", "right")}
                  className={`flex-1 py-2 px-2 border rounded text-sm transition ${
                    (block.textAlign || "left") === "right"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                  title="右寄せ"
                >
                  ➡
                </button>
              </div>
            </div>
          </>
        )}

        {/* すべての図形共通：枠線色と太さ */}
        {block.type !== "text" && block.type !== "titlePlaceholder" && block.type !== "subtitlePlaceholder" && (
          <>
            <div>
              <label className="block text-xs text-gray-500">枠線色</label>
              <input
                type="color"
                value={block.borderColor || "#000000"}
                onChange={(e) => handleChange("borderColor", e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500">枠線の太さ</label>
              <input
                type="number"
                value={block.borderWidth || 1}
                onChange={(e) => handleChange("borderWidth", Number(e.target.value))}
                className="w-full border rounded text-sm"
                min="1"
                max="10"
              />
            </div>
          </>
        )}

        {/* 四角形・円：背景色 */}
        {(block.type === "rect" || block.type === "circle") && (
          <div>
            <label className="block text-xs text-gray-500">背景色</label>
            <input
              type="color"
              value={block.backgroundColor || "#ffffff"}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        )}

        {/* 罫線：背景色 */}
        {block.type === "line" && (
          <div>
            <label className="block text-xs text-gray-500">線の色</label>
            <input
              type="color"
              value={block.borderColor || "#000000"}
              onChange={(e) => handleChange("borderColor", e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        )}

        {/* テーブル専用操作 */}
        {block.type === "table" && (
          <div className="border-t">
            <label className="block text-xs font-bold text-gray-600">
              テーブル操作
            </label>
            
            {/* 行数・列数の数値入力 */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500">行数</label>
                <input
                  type="number"
                  value={block.rows || 3}
                  onChange={(e) => handleRowsChange(Math.max(1, Number(e.target.value)))}
                  className="w-full border rounded text-sm"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500">列数</label>
                <input
                  type="number"
                  value={block.cols || 3}
                  onChange={(e) => handleColsChange(Math.max(1, Number(e.target.value)))}
                  className="w-full border rounded text-sm"
                  min="1"
                />
              </div>
            </div>

            {/* 行・列追加ボタン */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={addRow}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-1 rounded border border-blue-200 transition"
              >
                +行
              </button>
              <button
                onClick={addCol}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-1 rounded border border-blue-200 transition"
              >
                +列
              </button>
            </div>
            
            {/* セル編集モード */}
            {selectedCell && block.cells && block.cells[selectedCell.row] && block.cells[selectedCell.row][selectedCell.col] && (
              <div className="border-t mt-2 pt-2">
                <label className="block text-xs font-bold text-gray-600">
                  セル編集 [{selectedCell.row}, {selectedCell.col}]
                </label>
                
                <div>
                  <label className="block text-xs text-gray-500">テキスト</label>
                  <textarea
                    value={block.cells[selectedCell.row][selectedCell.col].text || ""}
                    onChange={(e) => updateCell("text", e.target.value)}
                    className="w-full border rounded text-sm p-1 h-16"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">フォントサイズ</label>
                  <input
                    type="number"
                    value={block.cells[selectedCell.row][selectedCell.col].fontSize || 12}
                    onChange={(e) => updateCell("fontSize", Number(e.target.value))}
                    className="w-full border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">フォント太さ</label>
                  <select
                    value={block.cells[selectedCell.row][selectedCell.col].fontWeight || "normal"}
                    onChange={(e) => updateCell("fontWeight", e.target.value)}
                    className="w-full border rounded text-sm"
                  >
                    <option value="normal">通常</option>
                    <option value="bold">太字</option>
                    <option value="lighter">細字</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500">文字色</label>
                  <input
                    type="color"
                    value={block.cells[selectedCell.row][selectedCell.col].color || "#000000"}
                    onChange={(e) => updateCell("color", e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="text-[10px] text-gray-400 text-center mt-2">
              {block.rows} 行 × {block.cols} 列
            </div>
          </div>
        )}

        {/* 承認印プレースホルダー */}
        {block.type === "approvalStampPlaceholder" && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500">役割</label>
            <select
              value={block.role || "approver"}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border rounded text-sm px-2 py-1"
            >
              <option value="creator">作成者</option>
              <option value="checker">確認者</option>
              <option value="approver">承認者</option>
            </select>
          </div>
        )}

        {/* 管理番号プレースホルダー */}
        {block.type === "managementNumberPlaceholder" && (
          <div className="mt-2">
            <div className="text-xs text-gray-600 mb-2">
              管理番号プレースホルダー
            </div>
            <div className="text-[10px] text-gray-400">
              ライターページで自動的に管理番号が入力されます
            </div>
          </div>
        )}

        {/* 画像ブロック */}
        {block.type === "image" && (
          <div className="mt-2 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 font-semibold mb-2">
                画像
              </label>
              
              {/* 現在の画像プレビュー */}
              {block.src && (
                <div className="mb-3 border rounded p-2 bg-gray-50">
                  <img
                    src={block.src}
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
                {block.src ? "画像を変更" : "画像を選択"}
              </button>
              
              {/* トリミングボタン */}
              {block.src && (
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
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            {/* 画像のボーダー設定 */}
            <div>
              <label className="block text-xs text-gray-500">枠線の色</label>
              <input
                type="color"
                value={block.borderColor || "#cccccc"}
                onChange={(e) => handleChange("borderColor", e.target.value)}
                className="w-full h-8 border rounded cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500">枠線の太さ</label>
              <input
                type="number"
                value={block.borderWidth || 1}
                onChange={(e) => handleChange("borderWidth", Number(e.target.value))}
                className="w-full border rounded text-sm px-2 py-1"
                min="0"
                max="20"
              />
            </div>
          </div>
        )}
      </div>

      {/* トリミングモーダル */}
      {showCropModal && block.src && (
        <ImageCropModal
          imageSrc={block.src}
          onComplete={(croppedImage) => {
            onUpdate(block.id, { src: croppedImage });
            setShowCropModal(false);
          }}
          onCancel={() => setShowCropModal(false)}
        />
      )}
    </div>
  );
}