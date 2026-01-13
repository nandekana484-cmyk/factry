"use client";

type Props = {
  onAdd: (type: string, role?: string) => void;
};

export default function FieldPalette({ onAdd }: Props) {
  const shapes = [
    { type: "text", label: "テキスト" },
    { type: "rect", label: "四角形" },
    { type: "circle", label: "円" },
    { type: "triangle", label: "三角形" },
    { type: "arrow", label: "矢印" },
    { type: "line", label: "線" },
    { type: "table", label: "表" },
    { type: "image", label: "画像" },
  ];

  return (
    <div className="h-full bg-white overflow-y-auto p-4">
      <h2 className="font-bold text-lg mb-4 text-gray-700">図形追加</h2>

      <div className="space-y-2 flex flex-col">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            onClick={() => onAdd(shape.type)}
            className="w-full py-2 px-3 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 transition text-sm text-gray-700 font-medium"
          >
            {shape.label}を追加
          </button>
        ))}
      </div>
    </div>
  );
}