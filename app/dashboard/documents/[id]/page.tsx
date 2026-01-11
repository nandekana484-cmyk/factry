"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Document, getDocuments } from "@/lib/folderManagement";

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const docId = params.id as string;
    const documents = getDocuments();
    const found = documents.find((d) => d.id === docId);
    if (found) {
      setDocument(found);
    }
  }, [params.id]);

  if (!document) {
    return (
      <div className="p-8">
        <p>文書が見つかりません</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "下書き",
      submitted: "提出済み",
      checking: "確認中",
      approved: "承認済み",
      rejected: "差し戻し",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      submitted: "bg-blue-100 text-blue-700",
      checking: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← 戻る
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          PDF出力
        </button>
      </div>

      {/* 文書情報 */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              管理番号
            </label>
            <p className="text-lg font-mono">{document.managementNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              ステータス
            </label>
            <span
              className={`inline-block px-3 py-1 rounded ${getStatusColor(
                document.status
              )}`}
            >
              {getStatusLabel(document.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              タイトル
            </label>
            <p className="text-lg">{document.title}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              作成者
            </label>
            <p className="text-lg">{document.creator}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            作成日
          </label>
          <p>{new Date(document.createdAt).toLocaleString()}</p>
        </div>

        {/* メタデータ情報 */}
        {document.metadata && (
          <>
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-bold text-gray-700 mb-3">メタデータ</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">テンプレートID：</span>
                  <span className="font-mono text-gray-800">
                    {document.metadata.templateId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">階層：</span>
                  <span className="text-gray-800">
                    {document.metadata.hierarchy.join(" / ") || "ルート"}
                  </span>
                </div>
              </div>
            </div>

            {/* バージョン情報 */}
            {document.versions && document.versions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  バージョン（{document.versions.length}個）
                </h3>
                <div className="space-y-2">
                  {document.versions.map((version) => (
                    <div
                      key={version.id}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          v{version.versionNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        作成者: {version.createdBy}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        テキスト長: {version.fullText.length} 文字
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 全文プレビュー */}
      {document.fullText && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">全文プレビュー</h2>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 max-h-64 overflow-y-auto">
            {document.fullText || "（テキストなし）"}
          </div>
        </div>
      )}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">承認履歴</h2>
        <div className="space-y-3">
          {document.approvalHistory.map((record, index) => {
            const roleLabels: Record<string, string> = {
              creator: "作成者",
              checker: "確認者",
              approver: "承認者",
            };

            const statusLabels: Record<string, string> = {
              pending: "待機中",
              approved: "承認",
              rejected: "差し戻し",
            };

            const statusColors: Record<string, string> = {
              pending: "bg-gray-100 text-gray-600",
              approved: "bg-green-100 text-green-700",
              rejected: "bg-red-100 text-red-700",
            };

            return (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold w-20">
                    {roleLabels[record.role]}
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      statusColors[record.status]
                    }`}
                  >
                    {statusLabels[record.status]}
                  </span>
                  {record.userName && (
                    <span className="text-gray-700">{record.userName}</span>
                  )}
                </div>
                {record.timestamp && (
                  <span className="text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 文書プレビュー */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-bold mb-4">文書プレビュー</h2>
        <div className="border rounded p-4 bg-gray-50">
          <p className="text-gray-500 text-center">
            プレビュー機能は今後実装予定
          </p>
          <p className="text-sm text-gray-400 text-center mt-2">
            Blocks: {document.blocks.length} 個
          </p>
        </div>
      </div>
    </div>
  );
}
