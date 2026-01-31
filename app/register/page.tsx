"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.password || !form.passwordConfirm) {
      setError("全ての項目を入力してください");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
        <input
          name="name"
          type="text"
          placeholder="名前"
          value={form.name}
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
