"use client";

import { useState } from "react";
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
  const [showTemplateModal, setShowTemplateModal] = useState(false);

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
      <div className="p-4 border-b bg-white">
        <label className="block text-xs font-bold text-gray-700 mb-1">テンプレート選択</label>
        <button
          type="button"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowTemplateModal(true)}
        >
          テンプレート一覧を開く
        </button>
      </div>

      {/* テンプレート選択モーダル */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowTemplateModal(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">テンプレート一覧</h2>
            <TemplateSelectorModal
              handleLoadTemplate={(id: string) => {
                onLoadTemplate(id);
                setShowTemplateModal(false);
              }}
              templateRefresh={templateRefresh}
              templates={templates}
              loading={loadingTemplates}
            />
          </div>
        </div>
      )}

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
