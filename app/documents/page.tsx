"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: number;
  title: string;
  status: string;
  creator: {
    id: number;
    email: string;
  };
  blockCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "pending" | "approved">("all");

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const url = filter === "all" 
        ? "/api/documents"
        : `/api/documents?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">文書一覧</h1>
          <p className="text-gray-600">すべての文書を表示します</p>
        </div>

        {/* フィルター */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "draft"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            下書き
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            承認待ち
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "approved"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            承認済み
          </button>
        </div>

        {/* 文書一覧 */}
        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            文書がありません
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/documents/${doc.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {doc.title || "無題の文書"}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      doc.status
                    )}`}
                  >
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>作成者: {doc.creator.email}</span>
                  <span>•</span>
                  <span>ブロック数: {doc.blockCount}</span>
                  <span>•</span>
                  <span>
                    更新日: {new Date(doc.updatedAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
