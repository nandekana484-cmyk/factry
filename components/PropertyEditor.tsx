"use client";

interface PropertyEditorProps {
  selectedBlock: any;
  updateBlock: (id: string, updated: any) => void;
}

export default function PropertyEditor({ selectedBlock, updateBlock }: PropertyEditorProps) {
  if (!selectedBlock) {
    return (
      <div className="w-64 bg-white border-l p-4 text-gray-400 text-sm">
        ブロックを選択してください
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateBlock(selectedBlock.id, { [key]: value });
  };

  // --- テーブル操作用関数 ---
  const addRow = () => {
    const newCols = selectedBlock.cols;
    const newRow = Array.from({ length: newCols }).map(() => ({
      text: "", width: 80, height: 30 
    }));
    updateBlock(selectedBlock.id, {
      rows: selectedBlock.rows + 1,
      cells: [...selectedBlock.cells, newRow],
    });
  };

  const addCol = () => {
    const newCells = selectedBlock.cells.map((row: any) => [
      ...row,
      { text: "", width: 80, height: 30 },
    ]);
    updateBlock(selectedBlock.id, {
      cols: selectedBlock.cols + 1,
      cells: newCells,
    });
  };

  return (
    <div className="w-64 bg-white border-l p-4 overflow-y-auto shadow-sm">
      <h3 className="font-bold mb-4 border-b pb-2 text-gray-700">プロパティ</h3>
      
      <div className="space-y-4">
        {/* 基本座標 */}
        <div>
          <label className="block text-xs text-gray-500">位置 (X, Y)</label>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={Math.round(selectedBlock.x)}
              onChange={(e) => handleChange("x", Number(e.target.value))}
              className="w-full border p-1 rounded text-sm"
            />
            <input
              type="number"
              value={Math.round(selectedBlock.y)}
              onChange={(e) => handleChange("y", Number(e.target.value))}
              className="w-full border p-1 rounded text-sm"
            />
          </div>
        </div>

        {/* 色設定 (タイプによってラベルを変更) */}
        <div>
          <label className="block text-xs text-gray-500">
            {selectedBlock.type === "text" ? "文字色" : "枠線色"}
          </label>
          <input
            type="color"
            value={selectedBlock.color || selectedBlock.borderColor || "#000000"}
            onChange={(e) => 
              handleChange(selectedBlock.type === "text" ? "color" : "borderColor", e.target.value)
            }
            className="w-full h-8 mt-1 rounded cursor-pointer"
          />
        </div>

        {/* テキスト専用 */}
        {selectedBlock.type === "text" && (
          <div>
            <label className="block text-xs text-gray-500">サイズ</label>
            <input
              type="number"
              value={selectedBlock.fontSize}
              onChange={(e) => handleChange("fontSize", Number(e.target.value))}
              className="w-full border p-1 rounded text-sm"
            />
          </div>
        )}

        {/* テーブル専用操作 */}
        {selectedBlock.type === "table" && (
          <div className="pt-4 border-t space-y-2">
            <label className="block text-xs font-bold text-gray-600">テーブル操作</label>
            <button
              onClick={addRow}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-2 rounded border border-blue-200 transition"
            >
              行を追加
            </button>
            <button
              onClick={addCol}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-2 rounded border border-blue-200 transition"
            >
              列を追加
            </button>
            <div className="text-[10px] text-gray-400 mt-1 text-center">
              {selectedBlock.rows} 行 × {selectedBlock.cols} 列
            </div>
          </div>
        )}
      </div>
    </div>
  );
}