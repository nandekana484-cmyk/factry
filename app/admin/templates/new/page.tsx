"use client";

import FieldPalette from "@/components/FieldPalette";
import TemplateList from "@/components/TemplateList";
import PropertyEditor from "@/components/PropertyEditor";
import EditorContainer from "@/components/EditorContainer";
import { useEditor } from "@/lib/useEditor";

export default function TemplateCreatePage() {
  const {
    blocks,
    addBlock,
    updateBlock,
    selectedBlock,
    selectBlock,
  } = useEditor();

  return (
    <div className="flex h-screen">
      {/* 左カラム：フィールドパレット */}
      <FieldPalette onAdd={addBlock} />

      {/* 中央カラム：自由配置キャンバス（react-rnd） */}
      <EditorContainer
        blocks={blocks}
        updateBlock={updateBlock}
        selectBlock={selectBlock}   // ★ これが必須！
      />

      {/* 右カラム：テンプレート一覧 + プロパティ編集 */}
      <div className="w-80 border-l flex flex-col">
        <TemplateList />
        <PropertyEditor block={selectedBlock} onUpdate={updateBlock} />
      </div>
    </div>
  );
}