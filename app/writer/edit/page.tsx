"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function WriterEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftDocuments, setDraftDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Prisma APIから下書きを読み込む
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch("/api/documents?status=draft");
        if (response.ok) {
          const data = await response.json();
          setDraftDocuments(data.documents || []);
        }
      } catch (error) {
        console.error("下書き取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  // URLパラメータからdocumentIdを取得して、writerページに遷移
  const documentId = searchParams.get("documentId");
  useEffect(() => {
    if (documentId) {
      router.push(`/writer/write?documentId=${documentId}`);
    }
  }, [documentId, router]);

  const handleEditDraft = (draftId: number) => {
    router.push(`/writer/write?documentId=${draftId}`);
  };

  const handleDeleteDraft = async (draftId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("この下書きを削除してもよろしいですか?")) return;

    try {
      const response = await fetch(`/api/documents/${draftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDraftDocuments(draftDocuments.filter((doc) => doc.id !== draftId));
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link 
            href="/writer/menu" 
            className="text-sm text-gray-600 hover:text-gray-900 transition mb-2 inline-block"
          >
            ← メニューに戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">下書き編集</h1>
          <p className="text-gray-600">編集したい下書きを選択してください</p>
        </div>

        {/* 下書き一覧 */}
        {draftDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              下書きがありません
            </h3>
            <p className="text-gray-600 mb-6">
              まずは文書作成ページで下書きを保存してください
            </p>
            <Link
              href="/writer/write"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              文書作成ページへ
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftDocuments.map((draft) => (
              <Card
                key={draft.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
              >
                <div className="p-6">
                  {/* タイトル */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition">
                        {draft.title || "無題の文書"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(draft.updatedAt || draft.createdAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                  </div>

                  {/* ブロック数 */}
                  <div className="mb-4 text-sm text-gray-500">
                    📄 {draft.blockCount || 0} ブロック
                  </div>

                  {/* ボタン */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDraft(draft.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      編集する
                    </button>
                    <button
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 補足情報 */}
        {draftDocuments.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 ヒント</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 下書きは自動的にブラウザに保存されます</li>
              <li>• 編集中の内容は「下書き保存」で更新できます</li>
              <li>• 完成したら「承認申請」で提出してください</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
