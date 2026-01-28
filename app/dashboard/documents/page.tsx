"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EnhancedFolderTree from "@/components/EnhancedFolderTree";

interface Folder {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  children?: Folder[];
}

interface DocumentType {
  id: number;
  code: string;
  name: string;
}

interface Document {
  id: number;
  title: string;
  status: string;
  management_number: string | null;
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
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
    loadDocumentTypes();
  }, []);

  useEffect(() => {
    if (selectedFolderId !== null) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedFolderId, selectedTypeId]);

  const loadFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        const apiFolders = data.folders || [];
        
        // 階層構造を構築
        const buildTree = (items: Folder[]): Folder[] => {
          const map = new Map<number, Folder>();
          const roots: Folder[] = [];
          
          items.forEach(item => {
            map.set(item.id, { ...item, children: [] });
          });
          
          items.forEach(item => {
            const node = map.get(item.id)!;
            if (item.parent_id === null) {
              roots.push(node);
            } else {
              const parent = map.get(item.parent_id);
              if (parent) {
                parent.children!.push(node);
              }
            }
          });
          
          return roots;
        };
        
        setFolders(buildTree(apiFolders));
      }
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await fetch("/api/document-types");
      if (response.ok) {
        const data = await response.json();
        setDocumentTypes(data.documentTypes || []);
      }
    } catch (error) {
      console.error("Failed to load document types:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", "approved");
      if (selectedFolderId) params.append("folderId", String(selectedFolderId));
      if (selectedTypeId) params.append("typeId", String(selectedTypeId));
      
      const response = await fetch(`/api/documents?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const handleSelectFolder = (folderId: number, typeId: number | null) => {
    setSelectedFolderId(folderId);
    setSelectedTypeId(typeId);
  };

  const handleAddFolder = async (parentId: number | null, name: string, code: string) => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code: code.toUpperCase(),
          parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "フォルダーの作成に失敗しました");
        return;
      }

      alert("フォルダーを作成しました");
      await loadFolders();
    } catch (error) {
      console.error("Failed to add folder:", error);
      alert("フォルダーの作成に失敗しました");
    }
  };

  const handleEditFolder = async (folderId: number, name: string, code: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code.toUpperCase() }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "フォルダーの更新に失敗しました");
        return;
      }

      alert("フォルダーを更新しました");
      await loadFolders();
    } catch (error) {
      console.error("Failed to edit folder:", error);
      alert("フォルダーの更新に失敗しました");
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (!confirm("このフォルダーを削除しますか？\n※サブフォルダーや文書が存在する場合は削除できません")) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "フォルダーの削除に失敗しました");
        return;
      }

      alert("フォルダーを削除しました");
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
        setSelectedTypeId(null);
      }
      await loadFolders();
    } catch (error) {
      console.error("Failed to delete folder:", error);
      alert("フォルダーの削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文書管理</h1>
          <p className="text-sm text-gray-600">承認済み文書の閲覧</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← ダッシュボード
          </button>
          <button
            onClick={() => router.push("/admin/folders")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            フォルダー管理
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左側：フォルダーツリー */}
        <div className="w-80 border-r p-4 overflow-y-auto bg-gray-50">
          <EnhancedFolderTree
            folders={folders}
            documentTypes={documentTypes}
            selectedFolderId={selectedFolderId}
            selectedTypeId={selectedTypeId}
            onSelectFolder={handleSelectFolder}
            onAddFolder={handleAddFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            editable={true}
          />
        </div>

        {/* 右側：文書一覧 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedFolderId === null ? (
            <div className="text-center text-gray-400 py-12">
              <p className="text-lg">左側のフォルダーまたは文書種別を選択してください</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">承認済み文書一覧</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📁 フォルダーID: {selectedFolderId}</span>
                  {selectedTypeId && (
                    <>
                      <span>•</span>
                      <span>📄 文書種別ID: {selectedTypeId}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{documents.length}件</span>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-lg">
                  <p>承認済み文書がありません</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">管理番号</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">タイトル</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">文書種別</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">作成者</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">作成日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b hover:bg-gray-50 cursor-pointer transition"
                          onClick={() => router.push(`/documents/${doc.id}`)}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-blue-600">
                              {doc.management_number || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{doc.title}</td>
                          <td className="px-4 py-3">
                            {doc.documentType ? (
                              <span className="text-sm">
                                <span className="font-mono font-semibold text-blue-600">
                                  {doc.documentType.code}
                                </span>
                                <span className="text-gray-600 ml-1">
                                  （{doc.documentType.name}）
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {doc.creator.name || doc.creator.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(doc.created_at).toLocaleDateString("ja-JP")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
