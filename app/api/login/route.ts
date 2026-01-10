import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // SQLite からユーザー取得
  const user = findUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // パスワード照合
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Cookie に token と role を保存（セッション Cookie）
  const res = NextResponse.json({ ok: true, role: user.role });

  res.cookies.set({
    name: "token",
    value: "devtoken",
    httpOnly: true,
    secure: true,       // HTTPS 環境で安全に送信
    sameSite: "lax",    // セキュリティ向上
    path: "/",          // 全ページで有効
    // maxAge を書かない → セッション Cookie（ブラウザ閉じたら消える）
  });

  res.cookies.set({
    name: "role",
    value: user.role,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}