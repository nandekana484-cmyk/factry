import { UserRole } from "@/types/document";
import { canAssignWorkflowRole } from "@/lib/role";
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
  if (!user) return null;
  // roleをUserRole型にキャスト（小文字で統一）
  let normalizedRole = (user.role as string).toLowerCase();
  // 万一不正値が入っていた場合はcreatorにフォールバック
  if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
    normalizedRole = UserRole.CREATOR;
  }
  // UserRole型で返す
  return { ...user, role: normalizedRole as UserRole };
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
// 承認者権限チェック
export async function requireApprover() {
  const user = await requireAuth();
  if (!canAssignWorkflowRole(user.role, "approver")) {
    throw new Error("Approver role required");
  }
  return user;
}

// 管理者権限チェック
export async function requireAdmin() {
  const user = await requireAuth();
  // user.roleをUserRole型としてcanAssignWorkflowRoleに渡す
  if (!canAssignWorkflowRole(user.role as import("@/types/document").UserRole, "admin")) {
    throw new Error("Admin role required");
  }
  return user;
}

