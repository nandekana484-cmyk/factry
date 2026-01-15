"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: number;
  title: string;
  status: "draft" | "pending" | "approved";
  managementNumber?: string | null;
  creator: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
  approvalRequest?: {
    id: number;
    requester: {
      id: number;
      name?: string;
      email: string;
    };
    checker: {
      id: number;
      name?: string;
      email: string;
    };
    approver: {
      id: number;
      name?: string;
      email: string;
    };
    requested_at: string;
    comment: string | null;
  };
  latestRevision?: {
    id: number;
    managementNumber: string;
    revisionSymbol: string;
    approvedBy: { id: number; name: string } | null;
    approvedAt: string | null;
  } | null;
  blockCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name?: string;
  email: string;
  role: "admin" | "approver" | "user";
}

interface Block {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  src?: string;
}

interface DocumentDetail {
  id: number;
  title: string;
  status: string;
  managementNumber?: string | null;
  creator: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
  blocks: Block[];
  approvalRequest?: any;
  latestRevision?: {
    id: number;
    managementNumber: string;
    revisionSymbol: string;
    title: string;
    approvedBy: { id: number; name: string } | null;
    checkedBy: { id: number; name: string } | null;
    createdBy: { id: number; name: string };
    approvedAt: string | null;
  } | null;
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface HistoryItem {
  id: number;
  action: string;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
}

type SortKey = "createdAt" | "title" | "creator";
type SortOrder = "asc" | "desc";

export default function ApproverDashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [actioningId, setActioningId] = useState<number | null>(null);
  
  // ソート機能
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // バルク選択
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // モーダル
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [modalDocumentIds, setModalDocumentIds] = useState<number[]>([]);
  const [modalComment, setModalComment] = useState("");
  
  // プレビュー
  const [previewDocId, setPreviewDocId] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // 履歴
  const [historyMap, setHistoryMap] = useState<Record<number, HistoryItem[]>>({});

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser]);

  useEffect(() => {
    if (previewDocId) {
      fetchDocumentDetail(previewDocId);
    }
  }, [previewDocId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.ok) {
        setCurrentUser(data.user);
        if (data.user.role !== "approver" && data.user.role !== "admin") {
          setError("この機能にアクセスする権限がありません");
        }
      } else {
        setError("ログインが必要です");
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setError("ユーザー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents?status=pending");
      const data = await res.json();
      if (data.ok) {
        setDocuments(data.documents);
        // 最初のドキュメントをプレビュー表示
        if (data.documents.length > 0 && !previewDocId) {
          setPreviewDocId(data.documents[0].id);
        }
        // 各文書の履歴を取得
        data.documents.forEach((doc: Document) => {
          fetchHistory(doc.id);
        });
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setError("文書の取得に失敗しました");
    }
  };

  const fetchHistory = async (documentId: number) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/history`);
      const data = await res.json();
      if (data.ok) {
        setHistoryMap((prev) => ({ ...prev, [documentId]: data.history }));
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const fetchDocumentDetail = async (documentId: number) => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      const data = await res.json();
      if (data.ok) {
        setPreviewDoc(data.document);
      }
    } catch (error) {
      console.error("Failed to fetch document detail:", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const openModal = (action: "approve" | "reject", documentIds: number[]) => {
    setModalAction(action);
    setModalDocumentIds(documentIds);
    setModalComment("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalDocumentIds([]);
    setModalComment("");
  };

  const handleCheck = async (documentId: number) => {
    if (!currentUser) return;
    
    try {
      const res = await fetch("/api/documents/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          comment: "確認完了",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "確認処理に失敗しました");
      }

      // 成功：文書一覧を再読み込み
      await fetchDocuments();
      
      // プレビューを更新
      if (previewDocId === documentId) {
        await fetchDocumentDetail(documentId);
      }
      
      alert("確認が完了しました");
    } catch (error: any) {
      console.error("Check error:", error);
      alert(error.message || "確認処理に失敗しました");
    }
  };

  const executeAction = async () => {
    if (!modalAction || modalDocumentIds.length === 0) return;

    // 差し戻しの場合はコメント必須
    if (modalAction === "reject" && !modalComment.trim()) {
      setError("差し戻しにはコメントが必須です");
      return;
    }

    setError("");
    const endpoint = modalAction === "approve" 
      ? "/api/documents/approve" 
      : "/api/documents/reject";

    try {
      // 単一または複数の文書に対して処理
      for (const documentId of modalDocumentIds) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            comment: modalComment || "",
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `処理に失敗しました (ID: ${documentId})`);
        }
      }

      // 成功：一覧から削除
      setDocuments((prev) =>
        prev.filter((doc) => !modalDocumentIds.includes(doc.id))
      );
      setSelectedIds(new Set());
      
      // プレビューをクリア
      if (modalDocumentIds.includes(previewDocId || -1)) {
        const remaining = documents.filter(
          (doc) => !modalDocumentIds.includes(doc.id)
        );
        setPreviewDocId(remaining.length > 0 ? remaining[0].id : null);
        setPreviewDoc(null);
      }

      closeModal();
    } catch (error: any) {
      console.error("Failed to execute action:", error);
      setError(error.message || "処理に失敗しました");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedDocuments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedDocuments.map((doc) => doc.id)));
    }
  };

  // ソート機能
  const sortedDocuments = [...documents].sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sortKey) {
      case "createdAt":
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      case "title":
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case "creator":
        aVal = (a.creator.name || a.creator.email).toLowerCase();
        bVal = (b.creator.name || b.creator.email).toLowerCase();
        break;
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      submitted: "提出",
      approved: "承認",
      rejected: "差し戻し",
      withdrawn: "引き戻し",
      revised: "改定開始",
    };
    return labels[action] || action;
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-orange-100 text-orange-800",
      revised: "bg-purple-100 text-purple-800",
    };
    return styles[action] || "bg-gray-100 text-gray-800";
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "たった今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP");
  };

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // 権限がない場合
  if (
    !currentUser ||
    (currentUser.role !== "approver" && currentUser.role !== "admin")
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            権限がありません
          </div>
          <p className="text-gray-600 mb-4">
            この機能は承認者のみアクセス可能です
          </p>
          <button
            onClick={() => router.push("/documents")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            文書一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                承認者ダッシュボード
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                ログイン中: {currentUser.name || currentUser.email} ({currentUser.role})
              </p>
            </div>
            <button
              onClick={() => router.push("/documents")}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              文書一覧へ
            </button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* コントロールバー */}
          <div className="flex items-center justify-between gap-4">
            {/* ソート */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">ソート:</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">作成日</option>
                <option value="title">タイトル</option>
                <option value="creator">作成者</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
              >
                {sortOrder === "asc" ? "↑ 昇順" : "↓ 降順"}
              </button>
            </div>

            {/* バルク操作 */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  {selectedIds.size}件選択中
                </span>
                <button
                  onClick={() => openModal("approve", Array.from(selectedIds))}
                  className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  一括承認
                </button>
                <button
                  onClick={() => openModal("reject", Array.from(selectedIds))}
                  className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  一括差し戻し
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {sortedDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            承認待ちの文書はありません
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左: 文書一覧 */}
            <div className="space-y-4">
              {/* 全選択チェックボックス */}
              <div className="bg-white rounded-lg shadow p-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    sortedDocuments.length > 0 &&
                    selectedIds.size === sortedDocuments.length
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 font-medium">
                  すべて選択
                </label>
              </div>

              {/* 文書カード */}
              {sortedDocuments.map((doc) => {
                const latestHistory = historyMap[doc.id]?.[0];
                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer ${
                      previewDocId === doc.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setPreviewDocId(doc.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* チェックボックス */}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(doc.id);
                        }}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />

                      {/* コンテンツ */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {doc.title || "無題の文書"}
                          </h3>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            {doc.latestRevision && doc.latestRevision.revisionSymbol !== "R0" && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
                                改定版
                              </span>
                            )}
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                              承認待ち
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p>作成者: {doc.creator.name || doc.creator.email}</p>
                          {doc.approvalRequest && (
                            <>
                              <p>確認者: {doc.approvalRequest.checker.name || doc.approvalRequest.checker.email}</p>
                              <p>承認者: {doc.approvalRequest.approver.name || doc.approvalRequest.approver.email}</p>
                            </>
                          )}
                          <p>作成日: {formatRelativeTime(doc.createdAt)}</p>
                          {doc.latestRevision && (
                            <>
                              <p className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  {doc.latestRevision.managementNumber || "未承認"}
                                </span>
                                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                  {doc.latestRevision.revisionSymbol}
                                </span>
                              </p>
                              {doc.latestRevision.approvedBy && (
                                <p className="text-xs">
                                  前回承認者: {doc.latestRevision.approvedBy.name}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* 最新履歴 */}
                        {latestHistory && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${getActionBadge(
                                  latestHistory.action
                                )}`}
                              >
                                {getActionLabel(latestHistory.action)}
                              </span>
                              <span className="text-gray-600">
                                {latestHistory.user.name || latestHistory.user.email}
                              </span>
                              <span className="text-gray-500">
                                {formatRelativeTime(latestHistory.createdAt)}
                              </span>
                            </div>
                            {latestHistory.comment && (
                              <p className="text-gray-700">
                                {truncateText(latestHistory.comment, 50)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 右: プレビュー */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <div className="bg-white rounded-lg shadow h-full overflow-auto">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-600">読み込み中...</div>
                  </div>
                ) : previewDoc ? (
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {previewDoc.title || "無題の文書"}
                        </h2>
                        {previewDoc.latestRevision && previewDoc.latestRevision.revisionSymbol !== "R0" && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                            改定版
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          作成者: {previewDoc.creator.name || previewDoc.creator.email}
                        </p>
                        
                        {previewDoc.approvalRequest && (
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
                            <p className="text-gray-700">
                              <span className="font-medium">確認者:</span> {previewDoc.approvalRequest.checker.name || previewDoc.approvalRequest.checker.email}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">承認者:</span> {previewDoc.approvalRequest.approver.name || previewDoc.approvalRequest.approver.email}
                            </p>
                          </div>
                        )}
                        
                        {previewDoc.latestRevision && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-blue-900">
                                {previewDoc.latestRevision.managementNumber || "未承認"}
                              </span>
                              <span className="px-2 py-1 rounded text-sm bg-blue-200 text-blue-800 font-medium">
                                {previewDoc.latestRevision.revisionSymbol}
                              </span>
                            </div>
                            {previewDoc.latestRevision.approvedBy && (
                              <div className="text-sm space-y-1">
                                <p className="text-gray-700">
                                  <span className="font-medium">前回承認者:</span> {previewDoc.latestRevision.approvedBy.name}
                                </p>
                                {previewDoc.latestRevision.checkedBy && (
                                  <p className="text-gray-700">
                                    <span className="font-medium">前回確認者:</span> {previewDoc.latestRevision.checkedBy.name}
                                  </p>
                                )}
                                {previewDoc.latestRevision.approvedAt && (
                                  <p className="text-gray-600 text-xs">
                                    承認日: {new Date(previewDoc.latestRevision.approvedAt).toLocaleString("ja-JP")}
                                  </p>
                                )}
                              </div>
                            )}
                            {previewDoc.revisionCount > 0 && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/writer/${previewDoc.id}/revisions`);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                  改訂履歴を見る ({previewDoc.revisionCount}件) →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ブロック内容 */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">文書内容</h3>
                      {previewDoc.blocks.length === 0 ? (
                        <p className="text-gray-500">ブロックがありません</p>
                      ) : (
                        <div className="space-y-3">
                          {previewDoc.blocks.map((block) => (
                            <div key={block.id} className="border rounded p-3">
                              {block.type === "text" || block.type === "title" ? (
                                <p className="text-gray-900">
                                  {block.text || "（空）"}
                                </p>
                              ) : block.type === "image" ? (
                                block.src ? (
                                  <img
                                    src={block.src}
                                    alt="Document image"
                                    className="max-w-full h-auto"
                                  />
                                ) : (
                                  <div className="text-gray-500">画像なし</div>
                                )
                              ) : (
                                <div className="text-gray-500 text-sm">
                                  {block.type} ブロック
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="space-y-3">
                      {/* 確認者用ボタン（確認者または承認者が表示） */}
                      {currentUser && previewDoc.approvalRequest && 
                       (previewDoc.approvalRequest.checker.id === currentUser.id ||
                        previewDoc.approvalRequest.approver.id === currentUser.id) &&
                       previewDoc.status === "pending" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCheck(previewDoc.id)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            確認完了
                          </button>
                          <button
                            onClick={() => openModal("reject", [previewDoc.id])}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            差し戻し
                          </button>
                        </div>
                      )}
                      
                      {/* 承認者用ボタン（checkingまたはpending状態で表示） */}
                      {currentUser && previewDoc.approvalRequest && 
                       previewDoc.approvalRequest.approver.id === currentUser.id &&
                       (previewDoc.status === "checking" || previewDoc.status === "pending") && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => openModal("approve", [previewDoc.id])}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => openModal("reject", [previewDoc.id])}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            差し戻し
                          </button>
                        </div>
                      )}
                      
                      {/* 役割がない場合の表示（確認者でも承認者でもない） */}
                      {currentUser && previewDoc.approvalRequest && 
                       previewDoc.approvalRequest.checker.id !== currentUser.id &&
                       previewDoc.approvalRequest.approver.id !== currentUser.id && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                          この文書に対するアクション権限がありません
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/documents/${previewDoc.id}/history`)}
                      className="w-full mt-3 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      承認履歴を見る →
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    文書を選択してください
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* コメント入力モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {modalAction === "approve" ? "承認" : "差し戻し"}
              {modalDocumentIds.length > 1 && ` (${modalDocumentIds.length}件)`}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント
                {modalAction === "reject" && (
                  <span className="text-red-500 ml-1">（必須）</span>
                )}
              </label>
              <textarea
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder={
                  modalAction === "approve"
                    ? "承認コメントを入力（任意）"
                    : "差し戻しの理由を入力してください"
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                  modalAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {modalAction === "approve" ? "承認する" : "差し戻す"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
