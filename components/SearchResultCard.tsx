"use client";

import { useRouter } from "next/navigation";

export interface SearchResult {
  docId: string;
  managementNumber: string;
  title: string;
  createdAt: string;
  createdBy: string;
  snippet: string;
}

interface SearchResultCardProps {
  result: SearchResult;
}

export default function SearchResultCard({ result }: SearchResultCardProps) {
  const router = useRouter();

  const handleViewDetail = () => {
    router.push(`/dashboard/documents/${result.docId}`);
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-4 hover:shadow-lg transition">
      {/* タイトル行 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <button
            onClick={handleViewDetail}
            className="text-blue-600 hover:text-blue-800 underline text-lg font-semibold"
          >
            {result.managementNumber}
          </button>
          <p className="text-lg text-gray-800 mt-1">{result.title}</p>
        </div>
      </div>

      {/* メタデータ */}
      <div className="flex gap-4 text-sm text-gray-600 mb-3">
        <span>作成者: {result.createdBy}</span>
        <span>作成日: {new Date(result.createdAt).toLocaleDateString()}</span>
      </div>

      {/* スニペット */}
      <div className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded text-sm text-gray-700 mb-3">
        <p className="font-medium text-xs text-gray-600 mb-1">マッチした部分：</p>
        <p className="line-clamp-3">{result.snippet}</p>
      </div>

      {/* アクション */}
      <button
        onClick={handleViewDetail}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        詳細を表示 →
      </button>
    </div>
  );
}
