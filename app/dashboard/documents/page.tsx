"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FolderTree from "@/components/FolderTree";
import {
  Folder,
  Document,
  getFolders,
  addFolder,
  deleteFolder,
  renameFolder,
  getDocumentsByFolder,
} from "@/lib/folderManagement";

export default function DocumentsPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadDocuments(selectedFolder.id);
    }
  }, [selectedFolder]);

  const loadFolders = () => {
    setFolders(getFolders());
  };

  const loadDocuments = (folderId: string) => {
    const docs = getDocumentsByFolder(folderId);
    setDocuments(docs);
  };

  const handleAddFolder = (parentId: string, name: string) => {
    const updated = addFolder(parentId, name);
    setFolders(updated);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    const updated = renameFolder(folderId, newName);
    setFolders(updated);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updated = deleteFolder(folderId);
    setFolders(updated);
    if (selectedFolder?.id === folderId) {
      setSelectedFolder(null);
      setDocuments([]);
    }
  };

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

  const getApprovalStatus = (doc: Document) => {
    const creator = doc.approvalHistory.find((h) => h.role === "creator");
    const checker = doc.approvalHistory.find((h) => h.role === "checker");
    const approver = doc.approvalHistory.find((h) => h.role === "approver");

    return (
      <div className="flex gap-1 text-xs">
        <span
          className={`px-2 py-0.5 rounded ${
            creator?.status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          作成
        </span>
        <span
          className={`px-2 py-0.5 rounded ${
            checker?.status === "approved"
              ? "bg-green-100 text-green-700"
              : checker?.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          確認
        </span>
        <span
          className={`px-2 py-0.5 rounded ${
            approver?.status === "approved"
              ? "bg-green-100 text-green-700"
              : approver?.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          承認
        </span>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">文書管理</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左側：フォルダーツリー */}
        <div className="w-80 border-r p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="font-bold text-lg mb-2">フォルダー</h2>
          </div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolder?.id || null}
            onSelectFolder={setSelectedFolder}
            onAddFolder={handleAddFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        {/* 右側：文書一覧 */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedFolder ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {selectedFolder.name} 内の文書
                </h2>
                <p className="text-sm text-gray-500">
                  パス: {selectedFolder.path.join(" / ") || "ルート"}
                </p>
              </div>

              {documents.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  このフォルダーには文書がありません
                </div>
              ) : (
                <div className="bg-white rounded shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">
                          管理番号
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">
                          タイトル
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">
                          作成者
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">
                          作成日
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">
                          承認履歴
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            router.push(`/dashboard/documents/${doc.id}`)
                          }
                        >
                          <td className="px-4 py-2 text-sm font-mono text-blue-600 hover:underline">
                            {doc.managementNumber}
                          </td>
                          <td className="px-4 py-2 text-sm">{doc.title}</td>
                          <td className="px-4 py-2 text-sm">{doc.creator}</td>
                          <td className="px-4 py-2 text-sm">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">{getApprovalStatus(doc)}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                doc.status
                              )}`}
                            >
                              {getStatusLabel(doc.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              左のフォルダーツリーからフォルダーを選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
