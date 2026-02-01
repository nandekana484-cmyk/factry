// ...existing code...
function formatUserName(user: any) {
  return [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(" ");
}

// ...existing code...
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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

export default function DocumentHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string;

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [documentId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/history`);
      const data = await res.json();
      if (data.ok) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/documents/${documentId}`)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← 文書詳細に戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">承認履歴</h1>
          <p className="text-gray-600">
            この文書に対するすべてのアクション履歴を表示します
          </p>
        </div>

        {/* 履歴一覧 */}
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            履歴がありません
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-6 relative"
              >
                {/* タイムライン */}
                {index !== history.length - 1 && (
                  <div className="absolute left-8 top-full h-4 w-0.5 bg-gray-300" />
                )}

                <div className="flex items-start gap-4">
                  {/* アイコン */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg">
                      {item.action === "approved"
                        ? "✓"
                        : item.action === "rejected"
                        ? "✗"
                        : item.action === "submitted"
                        ? "↑"
                        : item.action === "withdrawn"
                        ? "↓"
                        : "↺"}
                    </span>
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getActionBadge(
                          item.action
                        )}`}
                      >
                        {getActionLabel(item.action)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">{formatUserName(item.user) || item.user.email}</span>
                      <span className="text-gray-500 ml-2">
                        ({item.user.role})
                      </span>
                    </div>

                    {item.comment && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        {item.comment}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
