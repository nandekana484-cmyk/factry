"use client";
import { useEffect, useState } from "react";
import EnhancedFolderTree from "@/components/EnhancedFolderTree";
import AdminFolderTree from "./AdminFolderTree";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [folderIds, setFolderIds] = useState<number[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
    fetch("/api/folders")
      .then((res) => res.json())
      .then((data) => setFolders(data.folders || []));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      fetch(`/api/admin/users/${selectedUser.id}/folders`)
        .then((res) => res.json())
        .then((data) => setFolderIds(data.folderIds || []))
        .finally(() => setLoading(false));
    } else {
      setFolderIds([]);
    }
  }, [selectedUser]);

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    await fetch(`/api/admin/users/${selectedUser.id}/folders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderIds }),
    });
    setSaving(false);
    alert("保存しました");
  };

  return (
    <div className="flex h-full">
      {/* 左：ユーザー一覧 */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="font-bold mb-2">ユーザー一覧</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              className={`p-2 cursor-pointer rounded ${selectedUser?.id === user.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-600">{user.email}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </li>
          ))}
        </ul>
      </div>
      {/* 右：フォルダーツリー＋保存 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedUser ? (
          <>
            <h2 className="font-bold mb-2">{selectedUser.name} のフォルダー権限</h2>
            <div className="mb-4">
              <AdminFolderTree
                folders={folders}
                checkedIds={folderIds}
                onChange={setFolderIds}
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </>
        ) : (
          <div className="text-gray-500">ユーザーを選択してください</div>
        )}
      </div>
    </div>
  );
}
