"use client";

import { useRef } from "react";

type Props = {
  onAdd: (type: string, role?: string) => void;
  onAddImage?: (imageData: string) => void;
};

export default function FieldPalette({ onAdd, onAddImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shapes = [
    { type: "text", label: "テキスト" },
    { type: "rect", label: "四角形" },
    { type: "circle", label: "円" },
    { type: "triangle", label: "三角形" },
    { type: "arrow", label: "矢印" },
    { type: "line", label: "線" },
    { type: "table", label: "表" },
  ];

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像ファイルかチェック
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    // Base64に変換
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      if (imageData) {
        if (onAddImage) {
          onAddImage(imageData);
        } else {
          // フォールバック: 通常のaddBlock
          onAdd("image");
        }
      }
    };
    reader.readAsDataURL(file);

    // input要素をリセット（同じファイルを再度選択できるように）
    e.target.value = "";
  };

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
        
        {/* 画像追加ボタン */}
        <button
          onClick={handleImageClick}
          className="w-full py-2 px-3 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 transition text-sm text-gray-700 font-medium"
        >
          画像を追加
        </button>
        
        {/* 非表示のファイル入力 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}