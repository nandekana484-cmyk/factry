import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetMail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }
  // ランダムtoken生成
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30分有効

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt }
  });

  await sendResetMail(email, token);

  return NextResponse.json({ ok: true });
}
