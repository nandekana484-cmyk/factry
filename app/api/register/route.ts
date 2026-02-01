import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { last_name, first_name, middle_name, email, password, passwordConfirm, department_id, section_id, position_id } = await req.json();

  if (!last_name || !first_name || !email || !password || !passwordConfirm) {
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
  const name = [last_name, first_name, middle_name].filter(Boolean).join(" ");
  const user = await prisma.user.create({
    data: {
      last_name,
      first_name,
      middle_name: middle_name ? middle_name : null,
      name,
      email,
      password: hashed,
      role: "user",
      department_id: department_id ?? null,
      section_id: section_id ?? null,
      position_id: position_id ?? null,
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
