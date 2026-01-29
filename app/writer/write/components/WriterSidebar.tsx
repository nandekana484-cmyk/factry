"use client";

import FieldPalette from "@/components/FieldPalette";

interface WriterSidebarProps {
  onGoBack: () => void;
  onAddTextBlock: () => void;
  onAddPage: () => void;
  onAddBlock: (type: string, role?: string) => void;
  onAddImage?: (imageData: string) => void;
  templates: any[];
  draftDocuments: any[];
  onLoadTemplate: (templateId: string) => void;
  onLoadDraft: (draft: any) => void;
  documentTypes?: any[];
  selectedDocumentTypeId?: number | null;
  onSelectDocumentType?: (typeId: number | null) => void;
  folders?: any[];
  selectedFolderId?: number | null;
  onSelectFolder?: (folderId: number | null) => void;
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
  onAddImage,
  templates,
  draftDocuments,
  onLoadTemplate,
  onLoadDraft,
  documentTypes = [],
  selectedDocumentTypeId,
  onSelectDocumentType,
  folders = [],
  selectedFolderId,
  onSelectFolder,
}: WriterSidebarProps) {
  return (
    <div
      className="border-r bg-gray-50 flex flex-col h-full"
      style={{
        width: "260px",
        flex: "0 0 260px",
        minWidth: "260px",
        maxWidth: "260px"
      }}
      data-ignore-deselect="true"
    >
      {/* 最上部: テンプレート選択 */}
      <div className="p-4 border-b bg-white">
        <div>
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
      </div>

      {/* アクションボタン */}
      <div className="p-4 border-b bg-white">
        <button
          onClick={onAddPage}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
        >
          ページ追加
        </button>
      </div>

      {/* FieldPalette */}
      <div className="flex-1 overflow-y-auto">
        <FieldPalette 
          onAdd={onAddBlock}
          onAddImage={onAddImage}
        />
      </div>
    </div>
  );
}
