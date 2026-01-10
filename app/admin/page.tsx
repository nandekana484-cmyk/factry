"use client";

import { useEditor } from "@/lib/useEditor";

export default function AdminPage() {
  const { editorRef } = useEditor();

  return (
    <div className="p-4">
      <div id="editorjs" className="border p-4" />
    </div>
  );
}