"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchResultCard, { SearchResult } from "@/components/SearchResultCard";
import {
  getDocuments,
} from "@/lib/folderManagement";
import {
  searchDocuments,
} from "@/lib/documentSearch";

export default function SearchPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!keyword.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // ローカルの文書データから検索（後でAI検索APIに差し替え）
      const documents = getDocuments();
      const searchedDocs = searchDocuments(documents, keyword);

      // SearchResult形式に変換
      const formattedResults: SearchResult[] = searchedDocs.map((doc) => {
        // fullTextから最初のマッチ部分を抜粋（snipet）
        const lowerKeyword = keyword.toLowerCase();
        const lowerFullText = doc.fullText.toLowerCase();
        const matchIndex = lowerFullText.indexOf(lowerKeyword);
        
        let snippet = doc.fullText;
        if (matchIndex !== -1) {
          // マッチ部分を中心に前後100文字を抜粋
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(doc.fullText.length, matchIndex + keyword.length + 50);
          snippet = (start > 0 ? "..." : "") + 
            doc.fullText.substring(start, end) + 
            (end < doc.fullText.length ? "..." : "");
        } else {
          // マッチしなかった場合（タイトルや管理番号でマッチした場合）
          snippet = doc.fullText.substring(0, 150) + (doc.fullText.length > 150 ? "..." : "");
        }

        return {
          docId: doc.id,
          managementNumber: doc.managementNumber,
          title: doc.title,
          createdAt: doc.createdAt,
          createdBy: doc.creator,
          snippet,
        };
      });

      setResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white border-b p-6">
        <h1 className="text-3xl font-bold text-gray-900">AI検索</h1>
        <p className="text-gray-600 mt-2">
          文書を検索して、マッチした結果を表示します
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* 検索ボックス */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="検索キーワードを入力..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSearching || !keyword.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isSearching ? "検索中..." : "検索"}
            </button>
          </div>
        </form>

        {/* 検索結果 */}
        {hasSearched && (
          <>
            {isSearching ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 mt-4">検索中...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  「{keyword}」に一致する文書が見つかりません
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-700 font-medium">
                    {results.length}件の結果が見つかりました
                  </p>
                </div>

                {/* 検索結果一覧 */}
                <div>
                  {results.map((result) => (
                    <SearchResultCard key={result.docId} result={result} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* 初期状態 */}
        {!hasSearched && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              上の検索ボックスにキーワードを入力して検索してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
