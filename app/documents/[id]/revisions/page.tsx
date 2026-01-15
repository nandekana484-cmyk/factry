"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Revision {
  id: number;
  managementNumber: string;
  revisionSymbol: string;
  title: string;
  approvedBy: {
    id: number;
    name?: string;
    email: string;
  } | null;
  checkedBy: {
    id: number;
    name?: string;
    email: string;
  } | null;
  createdBy: {
    id: number;
    name?: string;
    email: string;
  } | undefined;
  approvedAt: string | null;
  createdAt: string;
}

export default function RevisionHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string;

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchRevisions();
  }, [documentId]);

  const fetchRevisions = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/revisions`);
      const data = await res.json();
      if (data.ok) {
        setRevisions(data.revisions);
      } else {
        setError(data.error || "改訂履歴の取得に失敗しました");
      }
    } catch (error) {
      console.error("Failed to fetch revisions:", error);
      setError("改訂履歴の取得に失敗しました");
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/documents/${documentId}`)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← 文書詳細に戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">改訂履歴</h1>
          <p className="text-gray-600">
            文書の改訂履歴と承認情報を表示します
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 改訂履歴テーブル */}
        {revisions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            改訂履歴がありません
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      管理番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      改定記号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      承認者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      確認者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      承認日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revisions.map((revision) => (
                    <tr key={revision.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {revision.managementNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          revision.revisionSymbol.startsWith('M') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {revision.revisionSymbol}
                          {revision.revisionSymbol.startsWith('M') && (
                            <span className="ml-1 text-xs">（軽微）</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {revision.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {revision.approvedBy ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {revision.approvedBy.name || revision.approvedBy.email}
                            </span>
                            {revision.approvedBy.name && (
                              <span className="text-xs text-gray-500">
                                {revision.approvedBy.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {revision.checkedBy ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {revision.checkedBy.name || revision.checkedBy.email}
                            </span>
                            {revision.checkedBy.name && (
                              <span className="text-xs text-gray-500">
                                {revision.checkedBy.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {revision.createdBy ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {revision.createdBy.name || revision.createdBy.email}
                            </span>
                            {revision.createdBy.name && (
                              <span className="text-xs text-gray-500">
                                {revision.createdBy.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {revision.approvedAt ? (
                          <div className="flex flex-col">
                            <span>
                              {new Date(revision.approvedAt).toLocaleDateString(
                                "ja-JP"
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(revision.approvedAt).toLocaleTimeString(
                                "ja-JP"
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            承認待ち
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">改訂履歴について</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 管理番号（A-1, A-2...）は承認されるたびに更新されます</li>
            <li>• 改定記号（R1, R2...）は改定開始時に発行されます</li>
            <li>• 過去バージョンの承認印（承認者、確認者）は変更されません</li>
            <li>• 承認待ちの履歴は承認日が「承認待ち」と表示されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
