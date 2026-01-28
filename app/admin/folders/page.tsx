"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Folder {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export default function FoldersAdminPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Folder>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", code: "", parent_id: null as number | null });

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      alert("フォルダーの取得に失敗しました");
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
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newForm.code.toUpperCase(),
          name: newForm.name,
          parentId: newForm.parent_id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "作成に失敗しました");
      }

      alert("フォルダーを作成しました");
      setIsCreating(false);
      setNewForm({ name: "", code: "", parent_id: null });
      fetchFolders();
    } catch (error: any) {
      console.error("Failed to create folder:", error);
      alert(error.message || "フォルダーの作成に失敗しました");
    }
  };

  const handleEdit = (folder: Folder) => {
    setEditingId(folder.id);
    setEditForm({ code: folder.code, name: folder.name, parent_id: folder.parent_id });
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.code || !editForm.name) {
      alert("コードと名称は必須です");
      return;
    }

    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editForm.code,
          name: editForm.name,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "更新に失敗しました");
      }

      alert("フォルダーを更新しました");
      setEditingId(null);
      setEditForm({});
      fetchFolders();
    } catch (error: any) {
      console.error("Failed to update folder:", error);
      alert(error.message || "フォルダーの更新に失敗しました");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`フォルダー「${name}」を削除しますか？\n※サブフォルダーや文書が存在する場合は削除できません`)) {
      return;
    }

    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "削除に失敗しました");
      }

      alert("フォルダーを削除しました");
      fetchFolders();
    } catch (error: any) {
      console.error("Failed to delete folder:", error);
      alert(error.message || "フォルダーの削除に失敗しました");
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return "ルート";
    const parent = folders.find(f => f.id === parentId);
    return parent ? `${parent.code}（${parent.name}）` : "不明";
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
            onClick={() => router.push("/dashboard/documents")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span>←</span>
            <span>文書管理に戻る</span>
          </button>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">フォルダー管理</h1>
            <p className="text-gray-600">フォルダーコードと名称の作成・編集・削除</p>
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
            <h2 className="text-xl font-bold mb-4">新規フォルダー</h2>
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
                  placeholder="例: QA"
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
                  placeholder="例: 品質保証部"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">親フォルダー</label>
                <select
                  value={newForm.parent_id || ""}
                  onChange={(e) => setNewForm({ ...newForm, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ルート</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.code}（{folder.name}）
                    </option>
                  ))}
                </select>
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
                  setNewForm({ name: "", code: "", parent_id: null });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* フォルダー一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">コード</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">親フォルダー</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {folders.map((folder) => (
                <tr key={folder.id} className="hover:bg-gray-50">
                  {editingId === folder.id ? (
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
                      <td className="px-6 py-4 text-gray-600">{getParentName(folder.parent_id)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(folder.id)}
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
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{folder.code}</td>
                      <td className="px-6 py-4 font-medium">{folder.name}</td>
                      <td className="px-6 py-4 text-gray-600">{getParentName(folder.parent_id)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(folder)}
                            className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(folder.id, folder.name)}
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

        {folders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            フォルダーがありません。新規作成してください。
          </div>
        )}
      </div>
    </div>
  );
}
