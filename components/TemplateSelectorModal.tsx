import React, { useState, useEffect } from "react";

interface TemplateSelectorModalProps {
  handleLoadTemplate: (templateId: string) => void;
  templateRefresh: any;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({ handleLoadTemplate, templateRefresh }) => {
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isTemplateListOpen) return;
    setLoading(true);
    fetch("/api/templates", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("/api/templates response", data);
        if (data.ok) {
          setTemplates(data.templates || []);
        } else {
          setTemplates([]);
        }
      })
      .finally(() => setLoading(false));
  }, [isTemplateListOpen, templateRefresh]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  const handleSelect = (id: string) => {
    console.log("handleSelect called with id:", id);
    const selected = templates.find((t) => t.id === id);
    if (selected) {
      const templateForEditor = {
        ...selected,
        blocks: selected.content,
      };
      delete templateForEditor.content;
      const stored = JSON.parse(localStorage.getItem("templates") || "[]");
      const idx = stored.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        stored[idx] = templateForEditor;
      } else {
        stored.push(templateForEditor);
      }
      localStorage.setItem("templates", JSON.stringify(stored));
    }
    console.log("calling handleLoadTemplate with id:", id);
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
                {templates.map((template) => (
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
