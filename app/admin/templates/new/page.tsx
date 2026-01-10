"use client";

import FieldPalette from "@/components/FieldPalette";
import TemplateList from "@/components/TemplateList";
import PropertyEditor from "@/components/PropertyEditor";
import EditorContainer from "@/components/EditorContainer";
import { useEditor } from "@/lib/useEditor";

export default function TemplateCreatePage() {
  const { addBlock, selectedBlock, updateBlock } = useEditor();

  return (
    <div className="flex h-screen">
      {/* 左カラム：フィールドパレット */}
      <FieldPalette onAdd={addBlock} />

      {/* 中央カラム：Editor.js */}
      <EditorContainer />

      {/* 右カラム：テンプレート一覧 + プロパティ編集 */}
      <div className="w-80 border-l flex flex-col">
        {/* 上段：テンプレート一覧 */}
        <TemplateList />

        {/* 下段：プロパティ編集（選択中ブロックを渡す） */}
        <PropertyEditor block={selectedBlock} onUpdate={updateBlock} />
      </div>
    </div>
  );
}