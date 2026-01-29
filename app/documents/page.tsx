"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: number;
  title: string;
  status: string;
  managementNumber?: string;
  folder?: {
    id: number;
    name: string;
    code: string;
  };
  documentType?: {
    id: number;
    code: string;
    name: string;
  };
  creator: {
    id: number;
    name?: string;
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
  const [filter, setFilter] = useState<"checking" | "pending">("checking");
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [filter, selectedTypeId]);

  const fetchDocumentTypes = async () => {
    try {
      const res = await fetch("/api/document-types");
      const data = await res.json();
      if (data.ok) {
        setDocumentTypes(data.documentTypes);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", filter);
      if (selectedTypeId) params.append("typeId", String(selectedTypeId));
      
      const url = `/api/documents?${params.toString()}`;
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
      checking: "bg-blue-200 text-blue-800",
      pending: "bg-yellow-200 text-yellow-800",
      approved: "bg-green-200 text-green-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-200 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "下書き",
      checking: "確認待ち",
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
        {/* 戻るボタン */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span>←</span>
            <span>戻る</span>
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span>🏠</span>
            <span>ダッシュボードへ</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">承認フロー</h1>
          <p className="text-gray-600">確認・承認待ちの文書を表示します</p>
        </div>

        {/* フィルター */}
        <div className="mb-6 space-y-4">
          {/* ステータスフィルター */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("checking")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "checking"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              確認待ち
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
          </div>

          {/* 文書種別フィルター */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">文書種別:</label>
            <select
              value={selectedTypeId || ""}
              onChange={(e) => setSelectedTypeId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {documentTypes.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.code} - {type.name}
                </option>
              ))}
            </select>
          </div>
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
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {doc.title || "無題の文書"}
                    </h2>
                    {doc.managementNumber && (
                      <p className="text-sm text-gray-500 mt-1">
                        管理番号: {doc.managementNumber}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      doc.status
                    )}`}
                  >
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {doc.folder && (
                    <>
                      <span>📁 {doc.folder.name}</span>
                      <span>•</span>
                    </>
                  )}
                  {doc.documentType && (
                    <>
                      <span>📄 {doc.documentType.code} - {doc.documentType.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>作成者: {doc.creator.name || doc.creator.email}</span>
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
