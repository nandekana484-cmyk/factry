"use client";

import FieldPalette from "@/components/FieldPalette";

interface WriterSidebarProps {
  onGoBack: () => void;
  onAddTextBlock: () => void;
  onAddPage: () => void;
  onAddBlock: (type: string, role?: string) => void;
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
  onGoBack,
  onAddTextBlock,
  onAddPage,
  onAddBlock,
  templates,
  draftDocuments,
  onLoadTemplate,
  onLoadDraft,
}: WriterSidebarProps) {
  return (
    <div
      className="border-r bg-gray-50 flex flex-col"
      style={{
        width: "260px",
        flex: "0 0 260px",
        minWidth: "260px",
        maxWidth: "260px"
      }}
      data-ignore-deselect="true"
    >
      {/* 最上部: テンプレート・下書き選択 */}
      <div className="p-4 border-b bg-white">
        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-700 mb-1">テンプレート選択</label>
          <select
            onChange={(e) => e.target.value && onLoadTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="">テンプレートを選択...</option>
            {templates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">下書き選択</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                const draft = draftDocuments.find((d: any) => d.id === e.target.value);
                if (draft) onLoadDraft(draft);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="">下書きを選択...</option>
            {draftDocuments.map((draft: any) => (
              <option key={draft.id} value={draft.id}>
                {draft.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 上部: アクションボタン */}
      <div className="p-4 border-b bg-white">
        <button
          onClick={onGoBack}
          className="w-full mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← 戻る
        </button>

        <button
          onClick={onAddPage}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          ページ追加
        </button>
      </div>

      {/* 中部: FieldPalette */}
      <div className="flex-1 overflow-y-auto">
        <FieldPalette onAdd={onAddBlock} />
      </div>
    </div>
  );
}
