import React, { useState, useEffect } from "react";

interface TemplateSelectorModalProps {
  handleLoadTemplate: (templateId: string) => void;
  templateRefresh?: any;
  templates?: any[];
  loading?: boolean;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  handleLoadTemplate,
  templateRefresh,
  templates = [],
  loading = false,
}) => {
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  // handleSelectはidのみ親に渡す
  const handleSelect = (id: string) => {
    handleLoadTemplate(id);
  };

  return (
    <>
      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : (
        <ul className="max-h-96 overflow-y-auto">
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
    </>
  );
};

export default TemplateSelectorModal;
