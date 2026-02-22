"use client";

import FieldPalette from "@/components/FieldPalette";
import TemplateSelectorModal from "@/components/TemplateSelectorModal";

interface WriterSidebarProps {
  onGoBack: () => void;
  onAddTextBlock: () => void;
  onAddPage: () => void;
  onAddBlock: (type: string, role?: string) => void;
  onAddImage?: (imageData: string) => void;
  draftDocuments: any[];
  onLoadTemplate: (templateId: string) => void;
  templateRefresh: any;
  onLoadDraft: (draft: any) => void;
  documentTypes?: any[];
  selectedDocumentTypeId?: number | null;
  onSelectDocumentType?: (typeId: number | null) => void;
  folders?: any[];
  selectedFolderId?: number | null;
  onSelectFolder?: (folderId: number | null) => void;
  templates: any[];
  loadingTemplates: boolean;
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
  draftDocuments,
  onLoadTemplate,
  templateRefresh,
  onLoadDraft,
  documentTypes = [],
  selectedDocumentTypeId,
  onSelectDocumentType,
  folders = [],
  selectedFolderId,
  onSelectFolder,
  templates,
  loadingTemplates,
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
      {/* 最上部: テンプレート選択モーダルボタン */}
      {/* テンプレート選択は親からpropsで受け取る設計に統一 */}
      <div className="p-4 border-b bg-white">
        <label className="block text-xs font-bold text-gray-700 mb-1">テンプレート選択</label>
        <TemplateSelectorModal
          handleLoadTemplate={onLoadTemplate}
          templateRefresh={templateRefresh}
          templates={templates}
          loading={loadingTemplates}
        />
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
