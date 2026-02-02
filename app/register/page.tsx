"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  type FormType = {
    last_name: string;
    first_name: string;
    middle_name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    department_id: number | null;
    section_id: number | null;
    position_id: number | null;
  };
  const [form, setForm] = useState<FormType>({
    last_name: "",
    first_name: "",
    middle_name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    department_id: null,
    section_id: null,
    position_id: null,
  });
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [positions, setPositions] = useState([]);
    useEffect(() => {
      fetch("/api/admin/departments").then(res => res.json()).then(data => setDepartments(data.departments));
      fetch("/api/admin/sections").then(res => res.json()).then(data => setSections(data.sections));
      fetch("/api/admin/positions").then(res => res.json()).then(data => setPositions(data.positions));
    }, []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.last_name || !form.first_name || !form.email || !form.password || !form.passwordConfirm) {
      setError("全ての項目を入力してください");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    // APIに送るpayload型を明示的に定義
    const payload = {
      last_name: form.last_name,
      first_name: form.first_name,
      middle_name: form.middle_name ? form.middle_name : null,
      email: form.email,
      password: form.password,
      passwordConfirm: form.passwordConfirm,
      department_id: form.department_id,
      section_id: form.section_id,
      position_id: form.position_id,
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "登録に失敗しました");
      return;
    }
    router.replace("/");
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded">
      <h2 className="text-2xl font-bold mb-4">新規登録</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            name="last_name"
            type="text"
            placeholder="姓 (必須)"
            value={form.last_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="first_name"
            type="text"
            placeholder="名 (必須)"
            value={form.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <input
          name="middle_name"
          type="text"
          placeholder="ミドルネーム (任意)"
          value={form.middle_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="メールアドレス"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="パスワード"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="passwordConfirm"
          type="password"
          placeholder="パスワード（確認）"
          value={form.passwordConfirm}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          value={form.department_id ?? ""}
          onChange={e => setForm({ ...form, department_id: e.target.value ? Number(e.target.value) : null, section_id: null })}
          className="w-full p-2 border rounded"
        >
          <option value="">部署を選択</option>
          {departments.map((dep: any) => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        <select
          value={form.section_id ?? ""}
          onChange={e => setForm({ ...form, section_id: e.target.value ? Number(e.target.value) : null })}
          className="w-full p-2 border rounded"
          disabled={!form.department_id}
        >
          <option value="">部門を選択</option>
          {sections.filter((sec: any) => sec.department_id === form.department_id).map((sec: any) => (
            <option key={sec.id} value={sec.id}>{sec.name}</option>
          ))}
        </select>
        <select
          value={form.position_id ?? ""}
          onChange={e => setForm({ ...form, position_id: e.target.value ? Number(e.target.value) : null })}
          className="w-full p-2 border rounded"
        >
          <option value="">職責を選択</option>
          {positions.map((pos: any) => (
            <option key={pos.id} value={pos.id}>{pos.name}</option>
          ))}
        </select>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "登録中..." : "新規登録"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-blue-600 underline">
          ログインはこちら
        </a>
      </div>
    </div>
  );
}
