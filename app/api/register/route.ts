import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password, passwordConfirm } = await req.json();

  if (!name || !email || !password || !passwordConfirm) {
    return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
  }
  if (password !== passwordConfirm) {
    return NextResponse.json({ error: "パスワードが一致しません" }, { status: 400 });
  }

  // email重複チェック
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 400 });
  }

  // パスワードハッシュ化
  const hashed = await bcrypt.hash(password, 10);

  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "user",
    },
  });

  // 認証Cookieセット（loginと同様にroleは小文字で保存）
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "token",
    value: "devtoken",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.cookies.set({
    name: "role",
    value: user.role.toLowerCase(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.cookies.set({
    name: "userId",
    value: user.id.toString(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res;
}
