// lib/editor.ts
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";

export function initEditor() {
  if (typeof window === "undefined") return;

  if (window.editor) return; // 二重初期化防止

  window.editor = new EditorJS({
    holder: "editorjs",
    tools: {
      header: Header,
      paragraph: Paragraph,
    },
  });
}