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
  setIsSaving: (saving: boolean) => void,
  documentTypeId?: number | null,
  folderId?: number | null
) => {
  const router = useRouter();

  const handleSaveDraft = useCallback(async () => {
    console.log("[handleSaveDraft] 下書き保存を開始");
    console.log("[handleSaveDraft] editor.blocks.length:", editor.blocks?.length || 0);
    console.log("[handleSaveDraft] documentTypeId:", documentTypeId);
    console.log("[handleSaveDraft] folderId:", folderId);
    
    // titlePlaceholderからタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    // ユーザーに名前を入力させる
    const userTitle = prompt("下書きの名前を入力してください:", autoTitle);
    
    if (userTitle === null) {
      // キャンセルされた
      console.log("[handleSaveDraft] ユーザーがキャンセルしました");
      return;
    }
    
    const finalTitle = userTitle.trim() || autoTitle;
    
    console.log("[handleSaveDraft] 保存タイトル:", finalTitle);
    
    setIsSaving(true);
    try {
      const payload = {
        title: finalTitle,
        blocks: editor.blocks,
        documentTypeId: documentTypeId,
        folderId: folderId,
      };
      
      console.log("[handleSaveDraft] 送信データ:", {
        title: payload.title,
        blocksCount: payload.blocks?.length || 0,
        documentTypeId: payload.documentTypeId,
        folderId: payload.folderId,
      });
      
      // 下書き保存専用APIを使用
      const response = await fetch("/api/documents/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      console.log("[handleSaveDraft] レスポンスステータス:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[handleSaveDraft] 下書き保存失敗:", {
          status: response.status,
          error: errorData,
        });
        
        // 認証エラーの場合はログインページにリダイレクト
        if (response.status === 401) {
          alert("セッションが期限切れです。再度ログインしてください。");
          window.location.href = "/login";
          return;
        }
        
        const errorMessage = errorData.error || `HTTPエラー ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("[handleSaveDraft] 保存成功:", result);
      
      const { documentId } = result;
      
      // currentDocumentIdを更新（上書き保存用）
      editor.setCurrentDocumentId(documentId);
      
      setIsDirty(false);
      setIsSaving(false);
      alert(`下書きを保存しました: ${finalTitle}`);
    } catch (error: any) {
      console.error("[handleSaveDraft] 下書き保存エラー:", error);
      alert(`下書きの保存に失敗しました: ${error.message || error}`);
      setIsSaving(false);
    }
  }, [editor, setIsDirty, setIsSaving, documentTypeId, folderId]);

  const handleOverwriteDraft = useCallback(async () => {
    console.log("[handleOverwriteDraft] 上書き保存を開始");
    console.log("[handleOverwriteDraft] currentDocumentId:", editor.currentDocumentId);
    
    if (!editor.currentDocumentId) {
      // IDがない場合は名前を付けて保存
      console.log("[handleOverwriteDraft] documentIdがないため、handleSaveDraftを呼び出します");
      await handleSaveDraft();
      return;
    }

    // titlePlaceholderからタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    console.log("[handleOverwriteDraft] 保存タイトル:", autoTitle);
    console.log("[handleOverwriteDraft] ブロック数:", editor.blocks?.length || 0);
    
    setIsSaving(true);
    try {
      const payload = {
        title: autoTitle,
        blocks: editor.blocks,
        documentId: editor.currentDocumentId,
        documentTypeId: documentTypeId,
        folderId: folderId,
      };
      
      console.log("[handleOverwriteDraft] 送信データ:", {
        title: payload.title,
        blocksCount: payload.blocks?.length || 0,
        documentId: payload.documentId,
        documentTypeId: payload.documentTypeId,
        folderId: payload.folderId,
      });
      
      // 下書き保存専用APIで上書き保存
      const response = await fetch("/api/documents/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      console.log("[handleOverwriteDraft] レスポンスステータス:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[handleOverwriteDraft] 上書き保存失敗:", {
          status: response.status,
          error: errorData,
        });
        
        // 認証エラーの場合はログインページにリダイレクト
        if (response.status === 401) {
          alert("セッションが期限切れです。再度ログインしてください。");
          window.location.href = "/login";
          return;
        }
        
        const errorMessage = errorData.error || `HTTPエラー ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("[handleOverwriteDraft] 上書き保存成功:", result);

      setIsDirty(false);
      setIsSaving(false);
      alert(`下書きを上書き保存しました: ${autoTitle}`);
    } catch (error: any) {
      console.error("[handleOverwriteDraft] 上書き保存エラー:", error);
      alert(`上書き保存に失敗しました: ${error.message || error}`);
      setIsSaving(false);
    }
  }, [editor, setIsDirty, setIsSaving, handleSaveDraft, documentTypeId, folderId]);

  const handleSubmitDocument = useCallback(async (folderId?: number, checkerId?: number, approverId?: number) => {
    console.log("[handleSubmitDocument] 文書提出を開始", { folderId, checkerId, approverId });
    // 本文からタイトルを自動抽出
    const autoTitle = extractTitleFromBlocks(editor.blocks);
    
    if (!checkerId || !approverId) {
      alert("確認者と承認者を選択してください");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        title: autoTitle,
        blocks: editor.blocks,
        documentId: editor.currentDocumentId || undefined,
        documentTypeId: documentTypeId,
        folderId: folderId,
      };
      
      console.log("[handleSubmitDocument] 下書き保存データ:", {
        title: payload.title,
        blocksCount: payload.blocks?.length || 0,
        documentId: payload.documentId,
        documentTypeId: payload.documentTypeId,
        folderId: payload.folderId,
      });
      
      // 1. まず下書きとして保存
      const saveDraftResponse = await fetch("/api/documents/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      console.log("[handleSubmitDocument] 下書き保存レスポンス:", saveDraftResponse.status);

      if (!saveDraftResponse.ok) {
        const errorData = await saveDraftResponse.json().catch(() => ({}));
        console.error("[handleSubmitDocument] 文書保存失敗:", {
          status: saveDraftResponse.status,
          error: errorData,
        });
        
        // 認証エラーの場合はログインページにリダイレクト
        if (saveDraftResponse.status === 401) {
          alert("セッションが期限切れです。再度ログインしてください。");
          window.location.href = "/login";
          return;
        }
        
        const errorMessage = errorData.error || `HTTPエラー ${saveDraftResponse.status}`;
        throw new Error(errorMessage);
      }

      const { documentId } = await saveDraftResponse.json();
      console.log("[handleSubmitDocument] 保存成功、documentId:", documentId);

      // 2. 承認申請（submit API を呼び出し）
      console.log("[handleSubmitDocument] 承認申請を開始");
      const submitResponse = await fetch("/api/documents/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentId,
          checkerId: checkerId,
          approverId: approverId,
          comment: `文書を提出しました: ${autoTitle}`,
        }),
        credentials: "include",
      });

      console.log("[handleSubmitDocument] 承認申請レスポンス:", submitResponse.status);

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        console.error("[handleSubmitDocument] 承認申請失敗:", {
          status: submitResponse.status,
          error: errorData,
        });
        
        // 認証エラーの場合はログインページにリダイレクト
        if (submitResponse.status === 401) {
          alert("セッションが期限切れです。再度ログインしてください。");
          window.location.href = "/login";
          return;
        }
        
        const errorMessage = errorData.error || `HTTPエラー ${submitResponse.status}`;
        throw new Error(errorMessage);
      }

      const result = await submitResponse.json();
      console.log("[handleSubmitDocument] 提出成功:", result);
      
      setIsDirty(false);
      setIsSaving(false);
      
      // 管理番号が生成された場合は表示
      const message = result.managementNumber
        ? `ドキュメントを提出しました\n管理番号: ${result.managementNumber}`
        : `ドキュメントを提出しました: ${autoTitle}`;
      
      alert(message);
      router.push("/dashboard/documents");
    } catch (error: any) {
      console.error("[handleSubmitDocument] 提出エラー:", error);
      alert(`ドキュメントの提出に失敗しました: ${error.message || error}`);
      setIsSaving(false);
    }
  }, [editor, setIsDirty, setIsSaving, router, documentTypeId, folderId]);

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
