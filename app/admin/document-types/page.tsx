"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DocumentType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentTypesAdminPage() {
  const router = useRouter();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DocumentType>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({ code: "", name: "", description: "", order: 0 });

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      const res = await fetch("/api/document-types");
      const data = await res.json();
      if (data.ok) {
        setDocumentTypes(data.documentTypes);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
      alert("文書種別の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newForm.code || !newForm.name) {
      alert("コードと名称は必須です");
      return;
    }

    try {
      const res = await fetch("/api/document-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "作成に失敗しました");
      }

      alert("文書種別を作成しました");
      setIsCreating(false);
      setNewForm({ code: "", name: "", description: "", order: 0 });
      fetchDocumentTypes();
    } catch (error: any) {
      console.error("Failed to create document type:", error);
      alert(error.message || "文書種別の作成に失敗しました");
    }
  };

  const handleEdit = (type: DocumentType) => {
    setEditingId(type.id);
    setEditForm({ code: type.code, name: type.name, description: type.description, order: type.order });
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.code || !editForm.name) {
      alert("コードと名称は必須です");
      return;
    }

    try {
      const res = await fetch(`/api/document-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "更新に失敗しました");
      }

      alert("文書種別を更新しました");
      setEditingId(null);
      setEditForm({});
      fetchDocumentTypes();
    } catch (error: any) {
      console.error("Failed to update document type:", error);
      alert(error.message || "文書種別の更新に失敗しました");
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`文書種別「${code}」を削除しますか？\n※この種別を使用している文書がある場合は削除できません`)) {
      return;
    }

    try {
      const res = await fetch(`/api/document-types/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "削除に失敗しました");
      }

      alert("文書種別を削除しました");
      fetchDocumentTypes();
    } catch (error: any) {
      console.error("Failed to delete document type:", error);
      alert(error.message || "文書種別の削除に失敗しました");
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
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span>←</span>
            <span>管理画面に戻る</span>
          </button>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">文書種別管理</h1>
            <p className="text-gray-600">文書種別コードの作成・編集・削除</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ＋ 新規作成
          </button>
        </div>

        {/* 新規作成フォーム */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">新規文書種別</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コード <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newForm.code}
                  onChange={(e) => setNewForm({ ...newForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: RP"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 報告書"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="文書種別の説明（任意）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                <input
                  type="number"
                  value={newForm.order}
                  onChange={(e) => setNewForm({ ...newForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                作成
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewForm({ code: "", name: "", description: "", order: 0 });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 文書種別一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">コード</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">説明</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">表示順</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documentTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  {editingId === type.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.code || ""}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          maxLength={10}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={editForm.order || 0}
                          onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(type.id)}
                            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                            }}
                            className="text-sm px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            キャンセル
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{type.code}</td>
                      <td className="px-6 py-4 font-medium">{type.name}</td>
                      <td className="px-6 py-4 text-gray-600">{type.description || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{type.order}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(type)}
                            className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(type.id, type.code)}
                            className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documentTypes.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            文書種別がありません。新規作成してください。
          </div>
        )}
      </div>
    </div>
  );
}
