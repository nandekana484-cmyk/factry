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

  const handleSaveDraft = useCallback(async () => {
    // titlePlaceholderからタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    // ユーザーに名前を入力させる
    const userTitle = prompt("下書きの名前を入力してください:", autoTitle);
    
    if (userTitle === null) {
      // キャンセルされた
      return;
    }
    
    const finalTitle = userTitle.trim() || autoTitle;
    
    setIsSaving(true);
    try {
      // Prisma APIで下書き保存
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          blocks: editor.blocks,
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      const { document } = await response.json();
      
      // currentDocumentIdを更新（上書き保存用）
      editor.setCurrentDocumentId(document.id);
      
      setIsDirty(false);
      setIsSaving(false);
      alert(`下書きを保存しました: ${finalTitle}`);
    } catch (error) {
      console.error("下書き保存エラー:", error);
      alert("下書きの保存に失敗しました");
      setIsSaving(false);
    }
  }, [editor, setIsDirty, setIsSaving]);

  const handleOverwriteDraft = useCallback(async () => {
    if (!editor.currentDocumentId) {
      // IDがない場合は名前を付けて保存
      await handleSaveDraft();
      return;
    }

    // titlePlaceholderからタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    setIsSaving(true);
    try {
      // Prisma APIで上書き保存
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitle,
          blocks: editor.blocks,
          status: "draft",
          documentId: editor.currentDocumentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to overwrite draft");
      }

      setIsDirty(false);
      setIsSaving(false);
      alert(`下書きを上書き保存しました: ${autoTitle}`);
    } catch (error) {
      console.error("上書き保存エラー:", error);
      alert("上書き保存に失敗しました");
      setIsSaving(false);
    }
  }, [editor, setIsDirty, setIsSaving, handleSaveDraft]);

  const handleSubmitDocument = useCallback(async (folderId?: number, checkerId?: number, approverId?: number) => {
    // 本文からタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    if (!checkerId || !approverId) {
      alert("確認者と承認者を選択してください");
      return;
    }
    
    setIsSaving(true);
    try {
      // 1. 下書きとして保存（localStorage）
      const savedDoc = editor.submitDocument(autoTitle, folderId);
      
      // 2. Prisma APIで文書を作成
      const createResponse = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: autoTitle,
          blocks: editor.blocks,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create document");
      }

      const { document } = await createResponse.json();

      // 3. 承認申請（submit API を呼び出し）
      const submitResponse = await fetch("/api/documents/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          folderId: folderId,
          checkerId: checkerId,
          approverId: approverId,
          comment: `文書を提出しました: ${autoTitle}`,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error("Failed to submit document");
      }

      const result = await submitResponse.json();
      
      setIsDirty(false);
      setIsSaving(false);
      
      // 管理番号が生成された場合は表示
      const message = result.managementNumber
        ? `ドキュメントを提出しました\n管理番号: ${result.managementNumber}`
        : `ドキュメントを提出しました: ${autoTitle}`;
      
      alert(message);
      router.push("/dashboard/documents");
    } catch (error) {
      console.error("提出エラー:", error);
      alert("ドキュメントの提出に失敗しました");
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
