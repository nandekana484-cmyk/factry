"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCookie } from "@/lib/utils";

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

interface Document {
  id: number;
  title: string;
  status: string;
  creator: {
    id: number;
    email: string;
    role: string;
  };
  blocks: Block[];
  approvalRequest?: {
    id: number;
    requester: {
      id: number;
      email: string;
    };
    requested_at: string;
    comment: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    // 現在のユーザー情報を取得
    fetchCurrentUser();
    fetchDocument();
  }, [documentId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.ok) {
        setCurrentUserId(data.user.id);
        setCurrentUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      const data = await res.json();
      if (data.ok) {
        setDocument(data.document);
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/documents/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: parseInt(documentId),
          userId: currentUserId,
          comment,
        }),
      });
      if (res.ok) {
        location.reload();
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/documents/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: parseInt(documentId),
          userId: currentUserId,
          comment,
        }),
      });
      if (res.ok) {
        location.reload();
      }
    } catch (error) {
      console.error("Failed to withdraw:", error);
    }
  };

  const handleRevise = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/documents/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: parseInt(documentId),
          userId: currentUserId,
          comment,
        }),
      });
      if (res.ok) {
        location.reload();
      }
    } catch (error) {
      console.error("Failed to revise:", error);
    }
  };

  const handleApprove = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/documents/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: parseInt(documentId),
          userId: currentUserId,
          comment,
        }),
      });
      if (res.ok) {
        location.reload();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/documents/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: parseInt(documentId),
          userId: currentUserId,
          comment,
        }),
      });
      if (res.ok) {
        location.reload();
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-gray-200 text-gray-800",
      pending: "bg-yellow-200 text-yellow-800",
      approved: "bg-green-200 text-green-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-200 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "下書き",
      pending: "承認待ち",
      approved: "承認済み",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const isCreator = document?.creator.id === currentUserId;
  const isApprover = currentUserRole === "approver";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">文書が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/documents")}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← 文書一覧に戻る
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {document.title || "無題の文書"}
              </h1>
              <p className="text-gray-600">作成者: {document.creator.email}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(
                document.status
              )}`}
            >
              {getStatusLabel(document.status)}
            </span>
          </div>
        </div>

        {/* 承認リクエスト情報 */}
        {document.approvalRequest && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">承認リクエスト</h3>
            <p className="text-sm text-yellow-800">
              申請者: {document.approvalRequest.requester.email}
            </p>
            <p className="text-sm text-yellow-800">
              申請日:{" "}
              {new Date(document.approvalRequest.requested_at).toLocaleString(
                "ja-JP"
              )}
            </p>
            {document.approvalRequest.comment && (
              <p className="text-sm text-yellow-800 mt-2">
                コメント: {document.approvalRequest.comment}
              </p>
            )}
          </div>
        )}

        {/* 文書内容 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">文書内容</h2>
          {document.blocks.length === 0 ? (
            <p className="text-gray-500">ブロックがありません</p>
          ) : (
            <div className="space-y-4">
              {document.blocks.map((block) => (
                <div key={block.id} className="border rounded p-4">
                  <div className="text-xs text-gray-500 mb-2">
                    タイプ: {block.type}
                  </div>
                  {block.type === "text" || block.type === "title" ? (
                    <div className="text-gray-900">{block.text || "（空）"}</div>
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
                    <div className="text-gray-500">
                      {block.type} ブロック（位置: {Math.round(block.x)}, {Math.round(block.y)}）
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 承認履歴ボタン */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/documents/${documentId}/history`)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            承認履歴を見る →
          </button>
        </div>

        {/* アクションエリア */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">アクション</h2>

          {/* コメント入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コメント（任意）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="コメントを入力..."
            />
          </div>

          {/* ボタン表示 */}
          <div className="flex gap-3">
            {/* 作成者用ボタン */}
            {isCreator && document.status === "draft" && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                提出
              </button>
            )}

            {isCreator && document.status === "pending" && (
              <button
                onClick={handleWithdraw}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                引き戻し
              </button>
            )}

            {isCreator && document.status === "approved" && (
              <button
                onClick={handleRevise}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                改定開始
              </button>
            )}

            {/* 承認者用ボタン */}
            {isApprover && document.status === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  承認
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  差し戻し
                </button>
              </>
            )}

            {/* ボタンがない場合 */}
            {!isCreator && !isApprover && (
              <p className="text-gray-500">
                この文書に対するアクション権限がありません
              </p>
            )}

            {isCreator && document.status === "pending" && !isApprover && (
              <p className="text-sm text-gray-500 ml-4 self-center">
                承認待ち状態です。引き戻すか、承認者の判断をお待ちください。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
