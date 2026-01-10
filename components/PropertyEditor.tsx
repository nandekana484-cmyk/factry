"use client";

type Props = {
  block: { id: string; type: string } | null;
  onUpdate: (blockId: string, newData: any) => void;
};

export default function PropertyEditor({ block, onUpdate }: Props) {
  if (!block) {
    return (
      <div className="flex-1 p-4">
        <h2 className="font-bold text-lg mb-2">プロパティ編集</h2>
        <div className="border rounded p-4 text-gray-500">
          ブロックを選択してください
        </div>
      </div>
    );
  }

  const isHeader = block.type === "header";

  return (
    <div className="flex-1 p-4">
      <h2 className="font-bold text-lg mb-2">プロパティ編集</h2>

      <div className="border rounded p-4 space-y-4">
        <p className="text-sm text-gray-600">ブロックID: {block.id}</p>
        <p className="text-sm text-gray-600">タイプ: {block.type}</p>

        {isHeader && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">見出しレベル</label>
            <select
              className="border rounded p-2 w-full"
              onChange={(e) =>
                onUpdate(block.id, { level: Number(e.target.value) })
              }
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}