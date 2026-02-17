
"use client";

import React, { useState } from "react";
import TemplateList from "@/components/TemplateList";
import PropertyEditor from "@/components/PropertyEditor";
import TemplateSelectorModal from "@/components/TemplateSelectorModal";

interface RightSidebarProps {
  editor: any;
  setIsDirty: (dirty: boolean) => void;
  templateRefresh: number;
  onLoadTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
}

/**
 * RightSidebar
 * 右側のTemplateList + PropertyEditorを担当
 */
export default function RightSidebar({
  editor,
  setIsDirty,
  templateRefresh,
  onLoadTemplate,
  onDeleteTemplate,
}: RightSidebarProps) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  return (
    <div 
      className="border-l flex flex-col"
      style={{
        width: "320px",
        flex: "0 0 320px",
        minWidth: "320px",
        maxWidth: "320px"
      }}
      data-ignore-deselect="true"
    >
      {/* 上段：テンプレート一覧ボタン */}
      <div className="border-b p-2 flex items-center justify-between">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowTemplateModal(true)}
        >
          テンプレート一覧を開く
        </button>
      </div>

      {/* モーダル */}
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
            />
          </div>
        </div>
      )}

      {/* 中央〜下段：プロパティ編集（大きく） */}
      <div className="flex-1 min-h-0 overflow-y-auto border-t">
        <PropertyEditor
          block={editor.selectedBlock}
          onUpdate={(id: string, updated: any) => {
            editor.updateBlock(id, updated);
            setIsDirty(true);
          }}
          selectedCell={editor.selectedCell}
          onSelectCell={editor.setSelectedCell}
        />
      </div>
    </div>
  );
}
