"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * 本文からタイトルを自動抽出する関数
 * titlePlaceholderがあればそれを優先、なければ最初のテキストから抽出
 */
const extractTitleFromBlocks = (blocks: any[]): string => {
  // titlePlaceholderからタイトルを抽出
  const titleBlock = blocks.find((b) => b.type === "titlePlaceholder");
  if (titleBlock && titleBlock.value && titleBlock.value.trim()) {
    return titleBlock.value.trim().slice(0, 40);
  }

  // titlePlaceholderがないか空の場合、テキストブロックから抽出
  const textBlocks = blocks.filter(
    (b) => b.type === "text" || b.type === "subtitlePlaceholder"
  );
  
  const allText = textBlocks
    .map((b) => (b.type === "text" ? b.label : b.value) || "")
    .join("\n")
    .trim();
  
  const lines = allText.split("\n").map((l) => l.trim());
  const firstLine = lines.find((l) => l.length > 0) || "無題";
  
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
    // titlePlaceholderからタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    // ユーザーに名前を入力させる
    const userTitle = prompt("下書きの名前を入力してください:", autoTitle);
    
    if (userTitle === null) {
      // キャンセルされた
      return;
    }
    
    const finalTitle = userTitle.trim() || autoTitle;
    editor.saveDraft(finalTitle);
    setIsDirty(false);
    alert(`下書きを保存しました: ${finalTitle}`);
  }, [editor, setIsDirty]);

  const handleOverwriteDraft = useCallback(() => {
    if (!editor.currentDocumentId) {
      // IDがない場合は名前を付けて保存
      handleSaveDraft();
      return;
    }

    // titlePlaceholderからタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    editor.overwriteDraft(autoTitle);
    setIsDirty(false);
    alert(`下書きを上書き保存しました: ${autoTitle}`);
  }, [editor, setIsDirty, handleSaveDraft]);

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

  const handleAddBlock = useCallback((type: string, role?: string) => {
    editor.addBlock(type, role);
    setIsDirty(true);
  }, [editor, setIsDirty]);

  const handleAddPage = useCallback(() => {
    const newPageNumber = editor.addPage();
    editor.switchPage(newPageNumber);
    setIsDirty(true);
  }, [editor, setIsDirty]);

  const handleDeletePage = useCallback((pageNumber: number) => {
    const success = editor.deletePage(pageNumber);
    if (success) {
      setIsDirty(true);
    }
  }, [editor, setIsDirty]);

  const handleSwitchPage = useCallback((pageNumber: number) => {
    editor.switchPage(pageNumber);
  }, [editor]);

  return {
    handleSaveDraft,
    handleOverwriteDraft,
    handleSubmitDocument,
    handleInsertAIText,
    handleInsertAITable,
    handleAddTextBlock,
    handleAddBlock,
    handleAddPage,
    handleDeletePage,
    handleSwitchPage,
  };
};
