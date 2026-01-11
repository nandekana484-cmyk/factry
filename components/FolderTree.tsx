"use client";

import { useState } from "react";
import { Folder } from "@/lib/folderManagement";

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folder: Folder) => void;
  onAddFolder: (parentId: string, name: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export default function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["root"]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleRename = (folder: Folder) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const handleRenameSubmit = (folderId: string) => {
    if (editingName.trim()) {
      onRenameFolder(folderId, editingName.trim());
    }
    setEditingId(null);
  };

  const handleAddSubmit = (parentId: string) => {
    if (newFolderName.trim()) {
      onAddFolder(parentId, newFolderName.trim());
      setNewFolderName("");
    }
    setAddingToId(null);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingId === folder.id;
    const isAddingChild = addingToId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* 展開アイコン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
            className="mr-1 w-4 h-4 flex items-center justify-center text-gray-500"
          >
            {hasChildren ? (isExpanded ? "▼" : "▶") : "　"}
          </button>

          {/* フォルダー名 */}
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleRenameSubmit(folder.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(folder.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="flex-1 border rounded px-2 py-0.5 text-sm"
              autoFocus
            />
          ) : (
            <div
              onClick={() => onSelectFolder(folder)}
              className="flex-1 text-sm"
            >
              📁 {folder.name}
            </div>
          )}

          {/* 操作ボタン */}
          {!isEditing && (
            <div className="flex gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingToId(folder.id);
                }}
                className="text-xs text-blue-500 hover:text-blue-700"
                title="サブフォルダーを追加"
              >
                +
              </button>
              {folder.id !== "root" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(folder);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    title="名前を変更"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`「${folder.name}」を削除しますか？`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                    title="削除"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 新規フォルダー追加フォーム */}
        {isAddingChild && (
          <div
            className="flex items-center py-1 px-2 bg-gray-50"
            style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
          >
            <span className="mr-1 w-4 h-4"></span>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) setAddingToId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubmit(folder.id);
                if (e.key === "Escape") {
                  setAddingToId(null);
                  setNewFolderName("");
                }
              }}
              placeholder="フォルダー名"
              className="flex-1 border rounded px-2 py-0.5 text-sm"
              autoFocus
            />
            <button
              onClick={() => handleAddSubmit(folder.id)}
              className="ml-2 text-xs text-blue-500 hover:text-blue-700"
            >
              追加
            </button>
          </div>
        )}

        {/* 子フォルダー */}
        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
      {folders.map((folder) => renderFolder(folder))}
    </div>
  );
}
