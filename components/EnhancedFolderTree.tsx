"use client";

import { useState } from "react";

interface FolderNode {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  children?: FolderNode[];
}

interface DocumentTypeNode {
  id: number;
  code: string;
  name: string;
}

interface EnhancedFolderTreeProps {
  folders: FolderNode[];
  documentTypes: DocumentTypeNode[];
  selectedFolderId: number | null;
  selectedTypeId: number | null;
  onSelectFolder: (folderId: number, typeId: number | null) => void;
  onAddFolder?: (parentId: number | null, name: string, code: string) => void;
  onEditFolder?: (folderId: number, name: string, code: string, parent_id: number | null) => void;
  onDeleteFolder?: (folderId: number) => void;
  editable?: boolean;
}

export default function EnhancedFolderTree({
  folders,
  documentTypes,
  selectedFolderId,
  selectedTypeId,
  onSelectFolder,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  editable = false,
}: EnhancedFolderTreeProps) {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set());
  const [expandedTypeIds, setExpandedTypeIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", parent_id: null as number | null });
  const [showAddForm, setShowAddForm] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({ name: "", code: "" });

  const toggleFolderExpand = (id: number) => {
    const newExpanded = new Set(expandedFolderIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolderIds(newExpanded);
  };

  const toggleTypeExpand = (folderId: number) => {
    const key = `folder-${folderId}`;
    const newExpanded = new Set(expandedTypeIds);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedTypeIds(newExpanded);
  };

  const renderDocumentTypes = (folder: FolderNode, level: number) => {
    const key = `folder-${folder.id}`;
    const isExpanded = expandedTypeIds.has(key);

    return (
      <div key={`types-${folder.id}`}>
        {/* 文書種別ヘッダー */}
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
          style={{ paddingLeft: `${level * 20 + 28}px` }}
          onClick={() => toggleTypeExpand(folder.id)}
        >
          <button className="mr-1 w-4 h-4 flex items-center justify-center">
            {isExpanded ? "▼" : "▶"}
          </button>
          <span className="text-xs">📄 文書種別</span>
        </div>

        {/* 文書種別リスト */}
        {isExpanded && documentTypes.map((type) => {
          const isSelected = selectedFolderId === folder.id && selectedTypeId === type.id;
          return (
            <div
              key={`type-${folder.id}-${type.id}`}
              className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${
                isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
              style={{ paddingLeft: `${level * 20 + 48}px` }}
              onClick={() => onSelectFolder(folder.id, type.id)}
            >
              <span className="mr-1 w-4 h-4"></span>
              <span className="font-mono text-blue-600 font-semibold">{type.code}</span>
              <span className="text-gray-600 ml-1">（{type.name}）</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolderIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id && selectedTypeId === null;
    const isEditing = editingId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        {/* フォルダー */}
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 ${
            isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* 展開アイコン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolderExpand(folder.id);
            }}
            className="mr-1 w-4 h-4 flex items-center justify-center text-gray-500"
          >
            {hasChildren || documentTypes.length > 0 ? (isExpanded ? "▼" : "▶") : "　"}
          </button>

          {/* フォルダー名 */}
          {isEditing ? (
            <div className="flex-1 flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-16 px-1 py-0.5 text-xs border rounded"
                placeholder="コード"
                maxLength={10}
              />
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="flex-1 px-1 py-0.5 text-xs border rounded"
                placeholder="名称"
              />
              <select
                value={editForm.parent_id ?? ''}
                onChange={e => setEditForm({ ...editForm, parent_id: e.target.value === '' ? null : Number(e.target.value) })}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="">ルート</option>
                {folders.filter(f => f.id !== folder.id).map(f => (
                  <option key={f.id} value={f.id}>{f.name}（{f.code}）</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (editForm.code && editForm.name && onEditFolder) {
                    onEditFolder(folder.id, editForm.name, editForm.code, editForm.parent_id);
                    setEditingId(null);
                  }
                }}
                className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-xs px-2 py-0.5 bg-gray-300 rounded hover:bg-gray-400"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center gap-1 cursor-pointer"
              onClick={() => onSelectFolder(folder.id, null)}
            >
              <span>📁</span>
              <span className="font-mono text-blue-600 font-semibold">{folder.code}</span>
              <span className="text-gray-700">（{folder.name}）</span>
              {editable && (
                <div className="ml-auto flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingId(folder.id);
                      setEditForm({ name: folder.name, code: folder.code, parent_id: folder.parent_id });
                    }}
                    className="text-xs px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setShowAddForm(folder.id)}
                    className="text-xs px-2 py-0.5 bg-green-200 rounded hover:bg-green-300"
                  >
                    +
                  </button>
                  {onDeleteFolder && (
                    <button
                      onClick={() => onDeleteFolder(folder.id)}
                      className="text-xs px-2 py-0.5 bg-red-200 rounded hover:bg-red-300"
                    >
                      削除
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* サブフォルダー追加フォーム */}
        {showAddForm === folder.id && (
          <div
            className="flex gap-1 items-center py-1 px-2 bg-yellow-50"
            style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
          >
            <span className="mr-1 w-4 h-4"></span>
            <input
              type="text"
              value={addForm.code}
              onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })}
              className="w-16 px-1 py-0.5 text-xs border rounded"
              placeholder="コード"
              maxLength={10}
            />
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="flex-1 px-1 py-0.5 text-xs border rounded"
              placeholder="名称"
            />
            <button
              onClick={() => {
                if (addForm.code && addForm.name && onAddFolder) {
                  onAddFolder(folder.id, addForm.name, addForm.code);
                  setShowAddForm(null);
                  setAddForm({ name: "", code: "" });
                }
              }}
              className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              追加
            </button>
            <button
              onClick={() => {
                setShowAddForm(null);
                setAddForm({ name: "", code: "" });
              }}
              className="text-xs px-2 py-0.5 bg-gray-300 rounded hover:bg-gray-400"
            >
              ×
            </button>
          </div>
        )}

        {/* 子要素 */}
        {isExpanded && (
          <>
            {/* サブフォルダー */}
            {hasChildren && folder.children!.map((child) => renderFolder(child, level + 1))}
            
            {/* 文書種別（最下層フォルダーのみ） */}
            {!hasChildren && documentTypes.length > 0 && renderDocumentTypes(folder, level + 1)}
          </>
        )}
      </div>
    );
  };

  console.log('[EnhancedFolderTree] folders prop:', folders);
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-100 font-bold text-sm border-b flex items-center justify-between">
        <span>フォルダーツリー</span>
        {editable && onAddFolder && (
          <button
            onClick={() => setShowAddForm(0)}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + ルートフォルダー追加
          </button>
        )}
      </div>
      {showAddForm === 0 && (
        <div className="flex gap-1 items-center py-2 px-2 bg-yellow-50 border-b">
          <span className="mr-1 w-4 h-4"></span>
          <input
            type="text"
            value={addForm.code}
            onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })}
            className="w-20 px-2 py-1 text-sm border rounded"
            placeholder="コード"
            maxLength={10}
          />
          <input
            type="text"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border rounded"
            placeholder="名称"
          />
          <button
            onClick={() => {
              if (addForm.code && addForm.name && onAddFolder) {
                onAddFolder(null, addForm.name, addForm.code);
                setShowAddForm(null);
                setAddForm({ name: "", code: "" });
              }
            }}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            追加
          </button>
          <button
            onClick={() => {
              setShowAddForm(null);
              setAddForm({ name: "", code: "" });
            }}
            className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
        </div>
      )}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {folders.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            フォルダーがありません
          </div>
        ) : (
          folders.map((folder) => renderFolder(folder, 0))
        )}
      </div>
    </div>
  );
}
