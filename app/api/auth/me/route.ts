import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// 現在のログインユーザー情報を取得
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const role = cookieStore.get("role");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 簡易実装: roleからユーザーを特定
    // 実際にはtokenから正確にユーザーを特定する必要があります
    const user = await prisma.user.findFirst({
      where: { role: (role?.value || "creator").toLowerCase() },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Failed to get current user" },
      { status: 500 }
    );
  }
}
