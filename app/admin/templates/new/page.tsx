"use client";

import FieldPalette from "@/components/FieldPalette";
import TemplateList from "@/components/TemplateList";
import PropertyEditor from "@/components/PropertyEditor";
import EditorContainer from "@/components/EditorContainer";
import { useEditor } from "@/lib/useEditor";

export default function TemplateCreatePage() {
  const { addBlock } = useEditor();

  return (
    <div className="flex h-screen">
      {/* 左カラム */}
      <FieldPalette onAdd={addBlock} />

      {/* 中央カラム */}
      <EditorContainer />

      {/* 右カラム */}
      <div className="w-80 border-l flex flex-col">
        <TemplateList />
        <PropertyEditor />
      </div>
    </div>
  );
}