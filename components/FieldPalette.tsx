"use client";

type Props = {
  onAdd: (type: string) => void;
};

export default function FieldPalette({ onAdd }: Props) {
  return (
    <div className="w-64 border-r p-4 space-y-4">
      <h2 className="font-bold text-lg mb-2">フィールドパレット</h2>

      <button
        onClick={() => onAdd("text")}
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        テキストを追加
      </button>
      <button onClick={() => onAdd("text")}>テキスト</button>
      <button onClick={() => onAdd("line")}>罫線</button>
      <button onClick={() => onAdd("rect")}>四角形</button>
      <button onClick={() => onAdd("circle")}>丸</button>
      <button onClick={() => onAdd("triangle")}>三角形</button>
      <button onClick={() => onAdd("arrow")}>矢印</button>
      <button onClick={() => onAdd("table")}>表</button>
      <button onClick={() => onAdd("image")}>画像</button>
    </div>
  );
}