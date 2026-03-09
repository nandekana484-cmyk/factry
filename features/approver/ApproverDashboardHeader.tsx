import type { User } from "@/types/document";

interface Props {
  user: User | null;
  onBack: () => void;
  error?: string;
}

export function ApproverDashboardHeader({ user, onBack, error }: Props) {
  return (
    <div className="mb-4">
      {/* ヘッダー本体 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">承認者ダッシュボード</h1>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              ログイン中: {user.name || user.email} ({user.role})
            </p>
          )}
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          文書一覧へ
        </button>
      </div>

      {/* エラー表示（ヘッダーの下に独立） */}
      {error && (
        <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}