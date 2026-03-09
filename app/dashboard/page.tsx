import { cookies } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { UserRole } from "@/types/document";
import { canAssignWorkflowRole, RoleMatrix } from "@/lib/role";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const roleRaw = cookieStore.get("role")?.value;
  const role = (roleRaw ? roleRaw.toLowerCase() : undefined) as UserRole | undefined;

  function getWorkflowKey(role: UserRole): keyof typeof RoleMatrix {
    return role;
  }

  // ★ 承認フローの遷移先をロールで決定
  const approvalFlowHref =
    role === UserRole.CHECKER
      ? "/checker"
      : role === UserRole.APPROVER || role === UserRole.ADMIN
      ? "/approver"
      : "/documents";

  // ★ メニュー一覧（承認フローは 1 つに統合）
  const menuItems = [
    {
      role: [UserRole.CREATOR, UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
      title: "マイページ",
      href: "/mypage",
      description: "自分の情報を編集",
      icon: "👤",
      color: "teal",
    },
    {
      role: [UserRole.CREATOR, UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
      title: "文書管理",
      href: "/dashboard/documents",
      description: "フォルダー管理と文書一覧",
      icon: "📄",
      color: "blue",
    },

    // ★ 承認フロー（1つに統合）
    {
      role: [UserRole.CREATOR, UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
      title: "承認フロー",
      href: approvalFlowHref,
      description: "文書の確認・承認・差し戻し",
      icon: "📋",
      color: "indigo",
    },

    {
      role: [UserRole.CREATOR, UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
      title: "AI検索",
      href: "/dashboard/search",
      description: "文書を検索",
      icon: "🤖",
      color: "green",
    },

    // ★ 管理者ページ（admin 専用）
    {
      role: [UserRole.ADMIN],
      title: "管理者ページ",
      href: "/admin",
      description: "管理者向けメニュー",
      icon: "🛠️",
      color: "purple",
    },

    {
      role: [UserRole.CREATOR, UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
      title: "ライターページ",
      href: "/writer/menu",
      description: "文書作成・編集メニュー",
      icon: "✏️",
      color: "pink",
    },
  ];

  // ★ 管理者はすべて表示、それ以外はロール判定
  const visibleItems = menuItems.filter((item) => {
    if (role === UserRole.ADMIN) return true;
    return (
      item.role.includes(role!) &&
      item.role.some((r) => canAssignWorkflowRole(role!, getWorkflowKey(r)))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">ダッシュボード</h1>
        <LogoutButton />
      </div>

      <p className="text-gray-600 mb-10">あなたの権限: {role}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href} className="group block">
            <div
              className={`
                h-full rounded-xl p-6 transition-all duration-300
                hover:shadow-2xl hover:-translate-y-2
                bg-gradient-to-br from-${item.color}-50 to-white
                border-2 border-${item.color}-100 hover:border-${item.color}-300
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-16 h-16 rounded-xl flex items-center justify-center text-3xl
                    bg-gradient-to-br from-${item.color}-400 to-${item.color}-600
                    shadow-lg group-hover:scale-110 transition-transform
                  `}
                >
                  {item.icon}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-2xl font-bold text-${item.color}-900 group-hover:text-${item.color}-700 transition`}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                <span>開く</span>
                <svg
                  className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}