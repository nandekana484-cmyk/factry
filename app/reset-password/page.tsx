"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.ok ? "パスワードを更新しました" : data.error || "更新に失敗しました");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="shadow-lg" style={{ width: 400 }}>
        <CardHeader>
          <CardTitle className="text-center font-bold" style={{ fontSize: 20 }}>
            パスワード再設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="flex flex-col gap-6">
            <div>
              <Label htmlFor="password">新しいパスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="新しいパスワード"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading || !password}>
              パスワードを更新
            </Button>
            {message && <p className="text-center text-sm text-blue-600">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
