import type { User } from "@/types/document";
import { canAssignWorkflowRole } from "@/lib/role";

export async function fetchCurrentUser(): Promise<{ user: User | null; error?: string }> {
  try {
    const res = await fetch("/api/auth/me");
    const data: { ok: boolean; user?: User } = await res.json();
    if (data.ok && data.user) {
      if (!canAssignWorkflowRole(data.user.role, "approver")) {
        return { user: null, error: "この機能にアクセスする権限がありません" };
      }
      return { user: data.user };
    } else {
      return { user: null, error: "ログインが必要です" };
    }
  } catch (error) {
    return { user: null, error: "ユーザー情報の取得に失敗しました" };
  }
}