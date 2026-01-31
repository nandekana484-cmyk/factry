"use client";

import { useEffect, useState, useMemo } from "react";
import { UserRow } from "./UserRow";
import { UserDetail } from "./UserDetail";

// 定数群
const ROLES = ["admin", "approver", "checker", "creator", "user"];
const ROLE_LABELS: Record<string, string> = {
  admin: "管理者(admin)",
  approver: "承認者(approver)",
  checker: "確認者(checker)",
  creator: "作成者(creator)",
  user: "未分類(user)",
};
const ROLE_ICONS: Record<string, string> = {
  admin: "🛠️",
  approver: "✔️",
  checker: "🔎",
  creator: "✏️",
  user: "❓",
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin?: string | null;
  folderId?: number;
};

// ユーザー一覧テーブル
function UserTable({
  users,
  onSelect,
  sortKey,
  sortOrder,
  onSort,
}: {
  users: User[];
  onSelect: (user: User) => void;
  sortKey: string;
  sortOrder: "asc" | "desc";
  onSort: (key: string) => void;
}) {
  const getDaysAgo = (lastLogin?: string | null) => {
    if (!lastLogin) return "-";
    const last = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "本日" : `${diffDays}日前`;
  };

  return (
    <table className="min-w-full border text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 cursor-pointer" onClick={() => onSort("name")}>名前{sortKey === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
          <th className="p-2 cursor-pointer" onClick={() => onSort("email")}>メール{sortKey === "email" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
          <th className="p-2 cursor-pointer" onClick={() => onSort("role")}>権限{sortKey === "role" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
          <th className="p-2 cursor-pointer" onClick={() => onSort("lastLogin")}>最終ログイン{sortKey === "lastLogin" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
          <th className="p-2 cursor-pointer" onClick={() => onSort("daysAgo")}>経過日数{sortKey === "daysAgo" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr
            key={user.id}
            className="hover:bg-blue-50 cursor-pointer"
            onClick={() => onSelect(user)}
          >
            <td className="p-2">{user.name}</td>
            <td className="p-2">{user.email}</td>
            <td className="p-2">{ROLE_LABELS[user.role] || user.role}</td>
            <td className="p-2">
              {user.lastLogin
                ? new Date(user.lastLogin).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </td>
            <td className="p-2">{getDaysAgo(user.lastLogin)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 管理画面本体
function AdminUsersPage() {
  // --- state群 ---
  const [users, setUsers] = useState<User[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState<string>("");
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<User[]>([]);

  // --- ユーザー再取得 ---
  const reloadUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  // --- ソート ---
  const sortedUsers = useMemo(() => {
    const arr = [...users];
    arr.sort((a, b) => {
      let aVal: any = a[sortKey as keyof User];
      let bVal: any = b[sortKey as keyof User];
      if (sortKey === "lastLogin") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      if (sortKey === "daysAgo") {
        const getDays = (d?: string | null) =>
          d ? Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)) : 99999;
        aVal = getDays(a.lastLogin);
        bVal = getDays(b.lastLogin);
      }
      if (aVal === bVal) return 0;
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return arr;
  }, [users, sortKey, sortOrder]);

  // --- ソートハンドラ ---
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // --- 検索 ---
  function handleSearch() {
    if (!search.trim()) return;
    setSearchMode(true);
    setSelectedUser(null);
    const keyword = search.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        (ROLE_LABELS[u.role] || u.role).toLowerCase().includes(keyword)
    );
    setSearchResult(filtered);
  }

  function handleClearSearch() {
    setSearchMode(false);
    setSearch("");
    setSearchResult([]);
  }

  // --- JSX ---
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-4">
        <a href="/admin" className="text-blue-600 hover:underline font-semibold">
          ← 管理者ページに戻る
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
      {message && (
        <div className="mb-4 p-2 bg-green-100 border border-green-300 text-green-800 rounded text-center">
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 min-h-[400px]">
        {/* 左カラム: ロールツリー＋ユーザーリスト */}
        <div className="md:col-span-2 border-r pr-4 overflow-y-auto max-h-[600px]">
          {/* 検索ボックス */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ユーザー名・メール・権限で検索"
              className="w-full border rounded px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleSearch}
              disabled={!search.trim()}
            >
              検索
            </button>
            {searchMode && (
              <button
                className="ml-1 px-2 py-2 rounded border text-xs text-gray-600 hover:bg-gray-100"
                onClick={handleClearSearch}
              >
                クリア
              </button>
            )}
          </div>
          {!searchMode &&
            ROLES.map((role) => {
              const roleUsers = users.filter((u) => u.role === role);
              const expanded = expandedRoles.includes(role);
              return (
                <div key={role} className="mb-2">
                  <div
                    className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 transition ${
                      expanded ? "bg-blue-100 font-bold" : "hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setExpandedRoles(
                        expanded
                          ? expandedRoles.filter((r) => r !== role)
                          : [...expandedRoles, role]
                      )
                    }
                  >
                    <span>{ROLE_ICONS[role]}</span>
                    <span>{ROLE_LABELS[role]}</span>
                    <span className="ml-auto text-xs text-gray-400">{roleUsers.length}人</span>
                    <span className="ml-2">{expanded ? "▼" : "▶"}</span>
                  </div>
                  {expanded && (
                    <div className="pl-8">
                      {roleUsers.length === 0 ? (
                        <div className="text-gray-400">ユーザーなし</div>
                      ) : (
                        roleUsers.map((user) => (
                          <div
                            key={user.id}
                            className={`px-2 py-1 rounded cursor-pointer mb-1 transition ${
                              selectedUser?.id === user.id
                                ? "bg-blue-50 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => setSelectedUser(user)}
                          >
                            <UserRow user={user} />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
        {/* 右カラム: 選択ユーザー詳細 or 一覧 or 検索結果 */}
        <div className="md:col-span-3 pl-4">
          {searchMode ? (
            <div>
              <div className="mb-2 text-gray-600">検索結果（{searchResult.length}件）</div>
              <UserTable
                users={searchResult}
                onSelect={setSelectedUser}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          ) : selectedUser ? (
            <UserDetail
              user={selectedUser}
              onDeleted={async () => {
                await reloadUsers();
                setSelectedUser(null);
              }}
            />
          ) : (
            <div>
              <div className="mb-2 text-gray-600">全ユーザー一覧（クリックで詳細表示）</div>
              <UserTable
                users={sortedUsers}
                onSelect={setSelectedUser}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;
