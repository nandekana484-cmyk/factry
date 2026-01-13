"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * 本文からタイトルを自動抽出する関数
 */
const extractTitleFromBlocks = (blocks: any[]): string => {
  // テキストブロックからテキストを抽出
  const textBlocks = blocks.filter(
    (b) => b.type === "text" || b.type === "titlePlaceholder"
  );
  
  // すべてのテキストを結合
  const allText = textBlocks
    .map((b) => b.label || "")
    .join("\n")
    .trim();
  
  // 最初の非空行を探す
  const lines = allText.split("\n").map((l) => l.trim());
  const firstLine = lines.find((l) => l.length > 0) || "無題";
  
  // 40文字で切り取る
  return firstLine.slice(0, 40);
};

/**
 * useWriterActions
 * Writer の各種アクション（保存・提出・ブロック追加など）を担当
 */
export const useWriterActions = (
  editor: any,
  setIsDirty: (dirty: boolean) => void,
  setIsSaving: (saving: boolean) => void
) => {
  const router = useRouter();

  const handleSaveDraft = useCallback(() => {
    // 本文からタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    editor.saveDraft(autoTitle);
    setIsDirty(false);
    alert(`下書きを保存しました: ${autoTitle}`);
  }, [editor, setIsDirty]);

  const handleSubmitDocument = useCallback(async () => {
    // 本文からタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    setIsSaving(true);
    try {
      editor.submitDocument(autoTitle);
      setIsDirty(false);
      setTimeout(() => {
        setIsSaving(false);
        alert(`ドキュメントを提出しました: ${autoTitle}`);
        router.push("/dashboard/documents");
      }, 1000);
    } catch (error) {
      console.error("提出エラー:", error);
      setIsSaving(false);
    }
  }, [editor, setIsDirty, setIsSaving, router]);

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
