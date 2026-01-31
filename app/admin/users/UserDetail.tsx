import { useState } from "react";
// 型定義
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin?: string | null;
  folderId?: number;
  disabled?: boolean;
};

type UserDetailProps = {
  user: User;
  onDeleted?: () => void;
};

const ROLE_OPTIONS = [
  { value: "user", label: "未分類(user)" },
  { value: "creator", label: "作成者(creator)" },
  { value: "checker", label: "確認者(checker)" },
  { value: "approver", label: "承認者(approver)" },
  { value: "admin", label: "管理者(admin)" },
];

export function UserDetail({ user, onDeleted }: UserDetailProps) {
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [disabled, setDisabled] = useState(!!user.disabled);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("本当にこのアカウントを削除しますか？この操作は元に戻せません。")) return;
    setDeleting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("アカウントを削除しました");
        if (onDeleted) onDeleted();
      } else {
        setMessage("削除に失敗しました");
      }
    } catch {
      setMessage("通信エラー");
    }
    setDeleting(false);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleSave = async () => {
    setUpdating(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, disabled }),
      });
      if (res.ok) {
        setMessage("保存しました");
      } else {
        setMessage("保存に失敗しました");
      }
    } catch {
      setMessage("通信エラー");
    }
    setUpdating(false);
    setTimeout(() => setMessage(""), 2000);
  };

  // 日付表示・経過日数計算
  let lastLoginStr = "-";
  let daysAgoStr = "-";
  if (user.lastLogin) {
    const last = new Date(user.lastLogin);
    lastLoginStr = last.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysAgoStr = diffDays === 0 ? "本日" : `${diffDays}日前`;
  }

  return (
    <div className="bg-white rounded shadow p-8 max-w-lg mx-auto relative">
      <h2 className="text-xl font-bold mb-4">ユーザー詳細</h2>
      {message && (
        <div className="mb-2 p-2 bg-green-100 border border-green-300 text-green-800 rounded text-center">{message}</div>
      )}
      <div className="mb-4">
        <label className="font-semibold mr-2">名前：</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          disabled={updating}
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold mr-2">メール：</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          disabled={updating}
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold mr-2">権限：</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          disabled={updating}
          className="border rounded px-2 py-1"
        >
          {ROLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <span className="font-semibold mr-2">最終ログイン：</span>
        <span>{lastLoginStr}</span>
        <span className="ml-4 text-gray-500">({daysAgoStr})</span>
      </div>
      <div className="mb-8 flex items-center">
        <input
          id="user-disabled"
          type="checkbox"
          checked={disabled}
          onChange={e => setDisabled(e.target.checked)}
          disabled={updating}
          className="mr-2"
        />
        <label htmlFor="user-disabled" className="select-none">アカウントを無効にする</label>
      </div>
      <div className="flex gap-4 items-end mt-8">
        <button
          onClick={handleSave}
          disabled={updating || deleting}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >保存</button>
        <button
          onClick={handleDelete}
          disabled={updating || deleting}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 disabled:opacity-50 ml-auto"
        >アカウント削除</button>
        {updating && <span className="ml-2 animate-spin">🔄</span>}
        {deleting && <span className="ml-2 animate-spin">⏳</span>}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded shadow hover:bg-gray-400"
          onClick={onDeleted}
        >
          戻る
        </button>
      </div>
    </div>
  );
}
