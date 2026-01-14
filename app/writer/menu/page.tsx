import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function WriterMenuPage() {
  const menuItems = [
    {
      title: "文書作成",
      href: "/writer/write",
      description: "テンプレートを使って文書を作成",
      icon: "✏️",
      color: "blue",
    },
    {
      title: "編集ページ",
      href: "/writer/edit",
      description: "既存の文書を編集",
      icon: "📝",
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* ヘッダー */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-600 hover:text-gray-900 transition mb-2 inline-block"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ライターメニュー</h1>
          <p className="text-gray-600">作成または編集する操作を選択してください</p>
        </div>

        {/* メニューカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block"
            >
              <Card className={`
                h-full transition-all duration-300 
                hover:shadow-2xl hover:-translate-y-2
                bg-gradient-to-br from-${item.color}-50 to-white
                border-2 border-${item.color}-100 hover:border-${item.color}-300
              `}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {/* アイコン */}
                    <div className={`
                      w-16 h-16 rounded-xl flex items-center justify-center text-3xl
                      bg-gradient-to-br from-${item.color}-400 to-${item.color}-600
                      shadow-lg group-hover:scale-110 transition-transform
                    `}>
                      <span className="filter drop-shadow">{item.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <CardTitle className={`text-2xl text-${item.color}-900 group-hover:text-${item.color}-700 transition`}>
                        {item.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* ホバー時の矢印アニメーション */}
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 補足情報 */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 ヒント</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>文書作成</strong>: テンプレートから新しい文書を作成できます</li>
            <li>• <strong>編集ページ</strong>: 下書き保存した文書を編集できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
