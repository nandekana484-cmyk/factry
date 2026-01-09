"use client";

import { useEditor } from "@/lib/useEditor";

export default function EditorContainer() {
  const { editorRef } = useEditor();

  return (
    <div className="flex-1 p-4">
      <h2 className="font-bold text-lg mb-2">テンプレート編集</h2>
      <div id="editorjs" className="border rounded p-4 min-h-[600px]" />
    </div>
  );
}