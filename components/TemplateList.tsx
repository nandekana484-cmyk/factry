"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  createdAt: number;
  blocks: any[];
}

interface TemplateListProps {
  onLoadTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  refreshKey?: number;
  selectedTemplateId?: string | null;
}

export default function TemplateList({ onLoadTemplate, onDeleteTemplate, refreshKey, selectedTemplateId }: TemplateListProps) {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // localStorageからテンプレートを読み込む
    const stored = localStorage.getItem("templates");
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  }, [refreshKey]); // refreshKeyが変わると再読み込み

  const handleDelete = (templateId: string) => {
    const updated = templates.filter((t) => t.id !== templateId);
    setTemplates(updated);
    localStorage.setItem("templates", JSON.stringify(updated));
    onDeleteTemplate?.(templateId); // 親コンポーネントに通知
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full p-2">
      <div className="font-bold text-sm mb-2">テンプレート一覧</div>
      <div className="text-xs text-gray-500 mb-2">クリックで読み込み</div>
      {templates.length === 0 ? (
        <div className="text-gray-400 text-sm p-2">
          保存済みテンプレートはありません
        </div>
      ) : (
        <ul className="border border-gray-200 divide-y divide-gray-200">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            return (
              <li
                key={template.id}
                className={`p-2 cursor-pointer transition flex justify-between items-center gap-2 ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => onLoadTemplate?.(template.id)}
                >
                  <div className={`font-medium text-sm truncate ${isSelected ? "text-blue-700" : ""}`}>
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(template.createdAt)}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(template.id);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
                >
                  削除
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}