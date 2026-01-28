"use client";

import { useState, useEffect } from "react";

interface Folder {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  children?: Folder[];
}

interface FolderSelectorProps {
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
}

export default function FolderSelector({
  selectedFolderId,
  onSelectFolder,
}: FolderSelectorProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFolders();
  }, []);

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
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
            className="mr-1 w-4 h-4 flex items-center justify-center text-gray-500"
          >
            {hasChildren ? (isExpanded ? "▼" : "▶") : "　"}
          </button>
          <span>📁</span>
          <span className="ml-1 font-mono text-blue-600 font-semibold text-sm">{folder.code}</span>
          <span className="ml-1 text-gray-700 text-sm">（{folder.name}）</span>
        </div>
        {isExpanded && hasChildren && folder.children!.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="border rounded bg-white">
      <div className="p-2 bg-gray-100 text-sm font-medium border-b flex items-center justify-between">
        <span>フォルダー選択</span>
        {selectedFolderId !== null && (
          <button
            onClick={() => onSelectFolder(null)}
            className="text-xs px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            選択解除
          </button>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto">
        {folders.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            フォルダーがありません
          </div>
        ) : (
          <>
            <div
              className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
                selectedFolderId === null ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
              onClick={() => onSelectFolder(null)}
            >
              <span className="mr-1 w-4 h-4"></span>
              <span className="text-sm text-gray-600">フォルダーなし</span>
            </div>
            {folders.map((folder) => renderFolder(folder, 0))}
          </>
        )}
      </div>
    </div>
  );
}
