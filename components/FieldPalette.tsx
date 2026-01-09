"use client";

type Props = {
  onAdd: (type: "header" | "paragraph") => void;
};

export default function FieldPalette({ onAdd }: Props) {
  return (
    <div className="w-64 border-r p-4 space-y-4">
      <h2 className="font-bold text-lg mb-2">フィールドパレット</h2>

      <button
        onClick={() => onAdd("header")}
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        見出しを追加
      </button>

      <button
        onClick={() => onAdd("paragraph")}
        className="w-full bg-green-500 text-white py-2 rounded"
      >
        段落を追加
      </button>
    </div>
  );
}