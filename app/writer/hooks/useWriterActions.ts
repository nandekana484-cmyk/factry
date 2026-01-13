"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * useWriterActions
 * Writer の各種アクション（保存・提出・ブロック追加など）を担当
 */
export const useWriterActions = (
  editor: any,
  documentTitle: string,
  setIsDirty: (dirty: boolean) => void,
  setIsSaving: (saving: boolean) => void
) => {
  const router = useRouter();

  const handleSaveDraft = useCallback(() => {
    if (!documentTitle.trim()) {
      alert("文書タイトルを入力してください");
      return;
    }
    
    editor.saveDraft(documentTitle);
    setIsDirty(false);
    alert("下書きを保存しました");
  }, [editor, documentTitle, setIsDirty]);

  const handleSubmitDocument = useCallback(async () => {
    if (!documentTitle.trim()) {
      alert("文書タイトルを入力してください");
      return;
    }
    
    setIsSaving(true);
    try {
      editor.submitDocument(documentTitle);
      setIsDirty(false);
      setTimeout(() => {
        setIsSaving(false);
        alert("ドキュメントを提出しました");
        router.push("/dashboard/documents");
      }, 1000);
    } catch (error) {
      console.error("提出エラー:", error);
      setIsSaving(false);
    }
  }, [editor, documentTitle, setIsDirty, setIsSaving, router]);

  const handleInsertAIText = useCallback((text: string) => {
    const lastBlock = editor.blocks[editor.blocks.length - 1];
    const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
    editor.addBlock("text");
    const newBlocks = [...editor.blocks];
    if (newBlocks.length > 0) {
      const lastBlockId = newBlocks[newBlocks.length - 1].id;
      editor.updateBlock(lastBlockId, { label: text, y: newY });
      setIsDirty(true);
    }
  }, [editor, setIsDirty]);

  const handleInsertAITable = useCallback((cells: any[][]) => {
    const lastBlock = editor.blocks[editor.blocks.length - 1];
    const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
    editor.addTableBlock(cells, 100, newY);
    setIsDirty(true);
  }, [editor, setIsDirty]);

  const handleAddTextBlock = useCallback(() => {
    editor.addBlock("text");
    setIsDirty(true);
  }, [editor, setIsDirty]);

  const handleAddPage = useCallback(() => {
    const newPageNumber = editor.addPage();
    editor.switchPage(newPageNumber);
    setIsDirty(true);
  }, [editor, setIsDirty]);

  const handleSwitchPage = useCallback((pageNumber: number) => {
    editor.switchPage(pageNumber);
  }, [editor]);

  return {
    handleSaveDraft,
    handleSubmitDocument,
    handleInsertAIText,
    handleInsertAITable,
    handleAddTextBlock,
    handleAddPage,
    handleSwitchPage,
  };
};
