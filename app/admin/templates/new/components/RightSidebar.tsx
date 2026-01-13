"use client";

import TemplateList from "@/components/TemplateList";
import PropertyEditor from "@/components/PropertyEditor";

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
  return (
    <div 
      className="w-80 border-l flex flex-col"
      data-ignore-deselect="true"
    >
      {/* 上段：テンプレート一覧（小さく） */}
      <div className="h-32 border-b overflow-y-auto">
        <TemplateList
          onLoadTemplate={onLoadTemplate}
          onDeleteTemplate={onDeleteTemplate}
          refreshKey={templateRefresh}
          selectedTemplateId={editor.selectedTemplateId}
        />
      </div>

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
