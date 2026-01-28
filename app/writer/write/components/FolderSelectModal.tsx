"use client";

import { useState, useEffect } from "react";

interface Folder {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
}

interface FolderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folder: Folder | null) => void;
  selectedFolderId?: number | null;
}

export default function FolderSelectModal({
  isOpen,
  onClose,
  onSelectFolder,
  selectedFolderId,
}: FolderSelectModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selected, setSelected] = useState<number | null>(selectedFolderId || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    const folder = folders.find((f) => f.id === selected) || null;
    onSelectFolder(folder);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-bold mb-4">フォルダを選択</h3>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            読み込み中...
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded mb-4">
              <div
                className={`p-3 cursor-pointer border-b hover:bg-gray-50 ${
                  selected === null ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
                onClick={() => setSelected(null)}
              >
                <div className="font-medium">フォルダなし</div>
                <div className="text-xs text-gray-500">フォルダに保存しない</div>
              </div>
              
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`p-3 cursor-pointer border-b hover:bg-gray-50 ${
                    selected === folder.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelected(folder.id)}
                >
                  <div className="font-medium">{folder.name}</div>
                  <div className="text-xs text-gray-500">コード: {folder.code}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSelect}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                選択
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
