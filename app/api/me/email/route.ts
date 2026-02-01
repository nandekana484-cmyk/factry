import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { password, newEmail } = body;
  if (!password || !newEmail) {
    return NextResponse.json({ error: "全て入力してください" }, { status: 400 });
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !dbUser.password) return NextResponse.json({ error: "ユーザー情報取得失敗" }, { status: 400 });
  const valid = await bcrypt.compare(password, dbUser.password);
  if (!valid) return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
  return NextResponse.json({ ok: true });
}
