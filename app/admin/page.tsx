export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">管理者メニュー</h1>

      <ul className="mt-4 space-y-2">
        <li>
          <a href="/admin/templates" className="text-blue-600 underline">
            テンプレート一覧
          </a>
        </li>

        <li>
          <a href="/admin/templates/new" className="text-blue-600 underline">
            テンプレート作成
          </a>
        </li>

        <li>
          <a href="/admin/users" className="text-blue-600 underline">
            ユーザー管理（必要なら）
          </a>
        </li>
      </ul>
    </div>
  );
}