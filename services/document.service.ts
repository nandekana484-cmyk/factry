// 型定義をファイル先頭に移動
import type { Document, ApprovalHistoryItem, DocumentDetail } from "../types/document";

export async function fetchDocuments(): Promise<{ documents: Document[]; error?: string }> {
  try {
    const res = await fetch("/api/documents?status=pending");
    const data: { ok: boolean; documents?: Document[] } = await res.json();
    if (data.ok && data.documents) {
      return { documents: data.documents };
    } else {
      return { documents: [], error: "文書の取得に失敗しました" };
    }
  } catch (error) {
    return { documents: [], error: "文書の取得に失敗しました" };
  }
}

export async function fetchHistory(documentId: number): Promise<ApprovalHistoryItem[]> {
  try {
    const res = await fetch(`/api/documents/${documentId}/history`);
    const data: { ok: boolean; history?: ApprovalHistoryItem[] } = await res.json();
    if (data.ok && data.history) {
      return data.history;
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function fetchDocumentDetail(documentId: number): Promise<DocumentDetail | null> {
  try {
    const res = await fetch(`/api/documents/${documentId}`);
    const data: { ok: boolean; document?: DocumentDetail } = await res.json();
    if (data.ok && data.document) {
      return data.document;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function handleCheck(documentId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/documents/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, comment: "確認完了" }),
    });
    if (!res.ok) {
      const data: { error?: string } = await res.json();
      throw new Error(data.error || "確認処理に失敗しました");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "確認処理に失敗しました" };
  }
}

export async function executeAction(
  action: "approve" | "reject",
  documentIds: number[],
  comment: string
): Promise<{ success: boolean; error?: string }> {
  const endpoint = action === "approve" ? "/api/documents/approve" : "/api/documents/reject";
  try {
    for (const documentId of documentIds) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, comment }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error || `処理に失敗しました (ID: ${documentId})`);
      }
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "処理に失敗しました" };
  }
}

export async function confirmDocument(documentId: number, comment?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/documents/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, comment }),
    });
    if (!res.ok) {
      const data: { error?: string } = await res.json();
      throw new Error(data.error || "確認処理に失敗しました");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "確認処理に失敗しました" };
  }
}

export async function approveDocument(documentId: number, comment?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/documents/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, comment }),
    });
    if (!res.ok) {
      const data: { error?: string } = await res.json();
      throw new Error(data.error || "承認処理に失敗しました");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "承認処理に失敗しました" };
  }
}

export async function rejectDocument(documentId: number, comment: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/documents/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, comment }),
    });
    if (!res.ok) {
      const data: { error?: string } = await res.json();
      throw new Error(data.error || "差し戻し処理に失敗しました");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "差し戻し処理に失敗しました" };
  }
}
