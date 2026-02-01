import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "無効なまたは期限切れのトークンです" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: reset.userId }, data: { password: hash } });
  await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
  return NextResponse.json({ ok: true });
}
