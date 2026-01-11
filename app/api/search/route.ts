import { NextRequest, NextResponse } from "next/server";

// 簡易的な全文検索API（後でベクトル検索に差し替え可能）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("q") || "";

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json([]);
    }

    // localStorage から文書データを取得（サーバーサイドなので実際はDBから取得）
    // クライアントサイドで実装するため、ここではダミー実装
    // 実際の運用ではデータベースから取得
    let documents: any[] = [];
    
    // 環境変数でDB接続情報が設定されている場合はそこから取得
    // それ以外は空配列（フロントで処理）

    return NextResponse.json([]);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
