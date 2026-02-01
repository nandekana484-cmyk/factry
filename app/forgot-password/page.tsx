"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.ok ? "再設定メールを送信しました" : data.error || "送信に失敗しました");
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
          <form onSubmit={handleSend} className="flex flex-col gap-6">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading || !email}>
              パスワード再設定メールを送信
            </Button>
            {message && <p className="text-center text-sm text-blue-600">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
