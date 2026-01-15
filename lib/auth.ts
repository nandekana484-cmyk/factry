import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// 現在のユーザーを取得
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const userIdCookie = cookieStore.get("userId");

  if (!token || !userIdCookie) {
    return null;
  }

  const userId = parseInt(userIdCookie.value);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
}

// 認証が必要なエンドポイント用
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// 承認者権限チェック
export async function requireApprover() {
  const user = await requireAuth();
  if (user.role !== "approver" && user.role !== "admin") {
    throw new Error("Approver role required");
  }
  return user;
}

// 管理者権限チェック
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }
  return user;
}
