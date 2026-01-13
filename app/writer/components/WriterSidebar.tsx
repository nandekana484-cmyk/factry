"use client";

interface WriterSidebarProps {
  isSaving: boolean;
  onGoBack: () => void;
  onSaveDraft: () => void;
  onSubmitDocument: () => void;
  onAddTextBlock: () => void;
  onAddPage: () => void;
  templates: any[];
  draftDocuments: any[];
  onLoadTemplate: (templateId: string) => void;
  onLoadDraft: (draft: any) => void;
}

/**
 * WriterSidebar
 * Writer左サイドバーの UI を担当
 */
export default function WriterSidebar({
  isSaving,
  onGoBack,
  onSaveDraft,
  onSubmitDocument,
  onAddTextBlock,
  onAddPage,
  templates,
  draftDocuments,
  onLoadTemplate,
  onLoadDraft,
}: WriterSidebarProps) {
  return (
    <div
      className="border-r bg-gray-50 overflow-y-auto p-4"
      style={{
        width: "260px",
        flex: "0 0 260px",
        minWidth: "260px",
        maxWidth: "260px"
      }}
      data-ignore-deselect="true"
    >
      <button
        onClick={onGoBack}
        className="w-full mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← 戻る
      </button>

      <button
        onClick={onSaveDraft}
        className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={isSaving}
      >
        下書き保存
      </button>

      <button
        onClick={onSubmitDocument}
        className="w-full mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={isSaving}
      >
        提出
      </button>

      <button
        onClick={onAddTextBlock}
        className="w-full mb-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        テキスト追加
      </button>

      <button
        onClick={onAddPage}
        className="w-full mb-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
      >
        ページ追加
      </button>

      <div className="border-t pt-4">
        <h3 className="font-bold mb-2">テンプレート</h3>
        <div className="space-y-2">
          {templates.map((template: any) => (
            <button
              key={template.id}
              onClick={() => onLoadTemplate(template.id)}
              className="w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-100 text-sm"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold mb-2">下書き</h3>
        <div className="space-y-2">
          {draftDocuments.map((draft: any) => (
            <button
              key={draft.id}
              onClick={() => onLoadDraft(draft)}
              className="w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-100 text-sm"
            >
              {draft.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
