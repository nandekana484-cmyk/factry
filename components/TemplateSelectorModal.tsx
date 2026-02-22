import React, { useState, useEffect } from "react";

interface TemplateSelectorModalProps {
  handleLoadTemplate: (templateId: string) => void;
  templateRefresh: any;
  templates: any[];
  loading: boolean;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({ handleLoadTemplate, templateRefresh, templates, loading }) => {
  // 外部状態props受け取り設計に統一（テンプレート一覧・ローディング状態は親で管理）
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);

  // templates, loadingは親からpropsで受け取る前提
  // useEffectは不要

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  // handleSelectはidのみ親に渡す
  const handleSelect = (id: string) => {
    handleLoadTemplate(id);
    setIsTemplateListOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full mb-2"
        onClick={() => setIsTemplateListOpen(true)}
      >
        テンプレート一覧を開く
      </button>

      {isTemplateListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsTemplateListOpen(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">テンプレート一覧</h2>
            {loading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : (
              <ul>
                {templates.length === 0 && (
                  <li className="text-gray-500 py-4 text-center">テンプレートがありません</li>
                )}
                {templates.map((template: any) => (
                  <li
                    key={template.id}
                    className="flex justify-between items-center px-2 py-2 hover:bg-blue-50 cursor-pointer rounded"
                    onClick={() => handleSelect(template.id)}
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-gray-500">{formatDate(template.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateSelectorModal;
