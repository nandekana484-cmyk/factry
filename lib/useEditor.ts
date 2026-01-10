"use client";

import { useEffect, useRef, useState } from "react";

type BlockType = "header" | "paragraph";

type SelectedBlock = {
  id: string;
  type: string;
};

export const useEditor = () => {
  const editorRef = useRef<any>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);

  useEffect(() => {
    let editor: any;

    const init = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;

      editor = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
        },
        data: {
          blocks: [],
        },

        onChange: async () => {
          try {
            const instance = editorRef.current;
            if (!instance) return;

            const index = instance.blocks.getCurrentBlockIndex();
            if (index === -1) {
              setSelectedBlock(null);
              return;
            }

            // @ts-ignore
            const block = instance.blocks.getBlockByIndex(index);
            if (!block) {
              setSelectedBlock(null);
              return;
            }

            setSelectedBlock({
              id: block.id,
              type: block.name,
            });
          } catch (e) {
            console.error("onChange error:", e);
          }
        },
      });

      editorRef.current = editor;
    };

    init();

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  const addBlock = async (type: BlockType) => {
    if (!editorRef.current) return;

    await editorRef.current.blocks.insert(type, {
      text: type === "header" ? "見出し" : "段落テキスト",
      level: 2,
    });
  };

  const updateBlock = async (blockId: string, newData: any) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const saved = await editor.save();

    const updatedBlocks = saved.blocks.map((b: any) =>
      b.id === blockId ? { ...b, data: { ...b.data, ...newData } } : b
    );

    await editor.render({ blocks: updatedBlocks });
  };

  return {
    editorRef,
    addBlock,
    selectedBlock,
    updateBlock,
  };
};