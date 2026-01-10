import { cookies } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  // 仮の統計データ（後で DB と接続可能）
  const stats = {
    templates: 12,
    pending: 3,
    completed: 8,
  };

  // ロール別に表示するメニュー
  const menuItems = [
    {
      role: ["admin", "approver"],
      title: "管理者ページ",
      href: "/admin",
    },
    {
      role: ["admin", "approver"],
      title: "承認者ページ",
      href: "/approver",
    },
    {
      role: ["admin", "approver", "user"],
      title: "ライターページ",
      href: "/writer",
    },
  ];

  // 現在のロールに合うものだけ表示
  const visibleItems = menuItems.filter((item) =>
    item.role.includes(role || "")
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <LogoutButton />
      </div>

      <p className="text-gray-600 mb-8">あなたの権限: {role}</p>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>テンプレート数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.templates}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>承認待ち</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>完了済み</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* メニューカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleItems.map((item) => (
          <Card
            key={item.href}
            className="hover:shadow-xl hover:-translate-y-1 transition bg-white"
          >
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={item.href} className="text-blue-600 underline">
                {item.title}へ
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}