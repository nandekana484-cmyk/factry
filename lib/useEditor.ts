"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";

export const useEditor = () => {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        tools: {
          header: Header,
          paragraph: Paragraph,
        },
        data: {
          blocks: [],
        },
      });

      editorRef.current = editor;
    }

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  const addBlock = async (type: "header" | "paragraph") => {
    if (!editorRef.current) return;

    await editorRef.current.blocks.insert(type, {
      text: type === "header" ? "見出し" : "段落テキスト",
      level: 2,
    });
  };

  return { editorRef, addBlock };
};