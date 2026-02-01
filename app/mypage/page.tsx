"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ROLE_OPTIONS = [
  { value: "user", label: "未分類(user)" },
  { value: "creator", label: "作成者(creator)" },
  { value: "checker", label: "確認者(checker)" },
  { value: "approver", label: "承認者(approver)" },
  { value: "admin", label: "管理者(admin)" },
];

type FormState = {
  last_name: string;
  first_name: string;
  middle_name: string;
  email: string;
  department_id: number | null;
  section_id: number | null;
  position_id: number | null;
};
type Master = { id: number; name: string; department_id?: number };

export default function MyPage() {
  const [form, setForm] = useState<FormState>({
    last_name: "",
    first_name: "",
    middle_name: "",
    email: "",
    department_id: null,
    section_id: null,
    position_id: null,
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [passwordModalState, setPasswordModalState] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
    message: ""
  });
  const [emailModalState, setEmailModalState] = useState({
    password: "",
    message: ""
  });
  const [departments, setDepartments] = useState<Master[]>([]);
  const [sections, setSections] = useState<Master[]>([]);
  const [positions, setPositions] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/departments").then(res => res.json()).then(data => setDepartments(data.departments));
    fetch("/api/admin/sections").then(res => res.json()).then(data => setSections(data.sections));
    fetch("/api/admin/positions").then(res => res.json()).then(data => setPositions(data.positions));
    fetch("/api/me").then(res => res.json()).then(data => {
      setForm({
        last_name: data.last_name ?? "",
        first_name: data.first_name ?? "",
        middle_name: data.middle_name ?? "",
        email: data.email ?? "",
        department_id: data.department_id ?? null,
        section_id: data.section_id ?? null,
        position_id: data.position_id ?? null,
      });
      setOriginalEmail(data.email ?? "");
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setMessage("");
    // メールアドレス変更時は再認証モーダル
    if (form.email !== originalEmail) {
      setShowEmailModal(true);
      return;
    }
    const payload: Partial<FormState> = { ...form };
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("保存しました");
      } else {
        setMessage("保存に失敗しました");
      }
    } catch {
      setMessage("通信エラー");
    }
    setTimeout(() => setMessage("") , 2000);
  };

  // パスワード変更モーダルの保存
  const handlePasswordChange = async () => {
    setPasswordModalState(s => ({ ...s, message: "" }));
    const { currentPassword, newPassword, newPasswordConfirm } = passwordModalState;
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordModalState(s => ({ ...s, message: "全て入力してください" }));
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordModalState(s => ({ ...s, message: "新しいパスワードが一致しません" }));
      return;
    }
    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setShowPasswordModal(false);
        setPasswordModalState({ currentPassword: "", newPassword: "", newPasswordConfirm: "", message: "" });
        setMessage("パスワードを変更しました");
      } else {
        setPasswordModalState(s => ({ ...s, message: data.error || "変更に失敗しました" }));
      }
    } catch {
      setPasswordModalState(s => ({ ...s, message: "通信エラー" }));
    }
  };

  // メール変更時の再認証モーダル
  const handleEmailChange = async () => {
    setEmailModalState(s => ({ ...s, message: "" }));
    if (!emailModalState.password) {
      setEmailModalState(s => ({ ...s, message: "パスワードを入力してください" }));
      return;
    }
    try {
      const res = await fetch("/api/me/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: emailModalState.password, newEmail: form.email }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setShowEmailModal(false);
        setEmailModalState({ password: "", message: "" });
        setOriginalEmail(form.email);
        setMessage("メールアドレスを変更しました");
      } else {
        setEmailModalState(s => ({ ...s, message: data.error || "変更に失敗しました" }));
      }
    } catch {
      setEmailModalState(s => ({ ...s, message: "通信エラー" }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="mb-2">
        <a href="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ダッシュボードへ戻る
        </a>
      </div>
      <div className="p-6 border rounded bg-white">
        <h2 className="text-2xl font-bold mb-4">マイページ</h2>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="flex gap-2">
          <input
            name="last_name"
            type="text"
            placeholder="姓 (必須)"
            value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
            className="w-full p-2 border rounded"
          />
          <input
            name="first_name"
            type="text"
            placeholder="名 (必須)"
            value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        <input
          name="middle_name"
          type="text"
          placeholder="ミドルネーム (任意)"
          value={form.middle_name}
          onChange={e => setForm(f => ({ ...f, middle_name: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="メールアドレス"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <select
            value={form.department_id ?? ""}
            onChange={e => setForm(f => ({ ...f, department_id: e.target.value ? Number(e.target.value) : null, section_id: null }))}
            className="w-full p-2 border rounded"
          >
            <option value="">部署を選択</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>
          <select
            value={form.section_id ?? ""}
            onChange={e => setForm(f => ({ ...f, section_id: e.target.value ? Number(e.target.value) : null }))}
            className="w-full p-2 border rounded"
            disabled={!form.department_id}
          >
            <option value="">部門を選択</option>
            {sections.filter(sec => sec.department_id === form.department_id).map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>
        <select
          value={form.position_id ?? ""}
          onChange={e => setForm(f => ({ ...f, position_id: e.target.value ? Number(e.target.value) : null }))}
          className="w-full p-2 border rounded"
        >
          <option value="">職責を選択</option>
          {positions.map(pos => (
            <option key={pos.id} value={pos.id}>{pos.name}</option>
          ))}
        </select>
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >保存</button>
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300"
            onClick={() => setShowPasswordModal(true)}
          >パスワードを変更する</button>
        </div>
        {message && (
          <div className="p-2 bg-green-100 border border-green-300 text-green-800 rounded text-center">{message}</div>
        )}
      </form>
      {/* パスワード変更モーダル */}
      {/* ここでカード本体divを閉じる */}
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-8 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">パスワード変更</h3>
            <input
              type="password"
              placeholder="現在のパスワード"
              value={passwordModalState.currentPassword}
              onChange={e => setPasswordModalState(s => ({ ...s, currentPassword: e.target.value }))}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="新しいパスワード"
              value={passwordModalState.newPassword}
              onChange={e => setPasswordModalState(s => ({ ...s, newPassword: e.target.value }))}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="新しいパスワード（確認）"
              value={passwordModalState.newPasswordConfirm}
              onChange={e => setPasswordModalState(s => ({ ...s, newPasswordConfirm: e.target.value }))}
              className="w-full p-2 border rounded mb-2"
            />
            {passwordModalState.message && <div className="text-red-500 mb-2">{passwordModalState.message}</div>}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                onClick={handlePasswordChange}
              >変更</button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400"
                onClick={() => setShowPasswordModal(false)}
              >キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* メール変更時の再認証モーダル */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-8 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">メールアドレス変更の認証</h3>
            <input
              type="password"
              placeholder="パスワードを入力してください"
              value={emailModalState.password}
              onChange={e => setEmailModalState(s => ({ ...s, password: e.target.value }))}
              className="w-full p-2 border rounded mb-2"
            />
            {emailModalState.message && <div className="text-red-500 mb-2">{emailModalState.message}</div>}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                onClick={handleEmailChange}
              >認証して変更</button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400"
                onClick={() => setShowEmailModal(false)}
              >キャンセル</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
