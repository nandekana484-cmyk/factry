"use client";

interface Page {
  id: string;
  number: number;
  blocks: any[];
}

interface WriterPageTabsProps {
  pages: Page[];
  currentPage: number;
  onSwitchPage: (pageNumber: number) => void;
  onDeletePage: (pageNumber: number) => void;
}

/**
 * WriterPageTabs
 * ページタブの UI を担当
 */
export default function WriterPageTabs({
  pages,
  currentPage,
  onSwitchPage,
  onDeletePage,
}: WriterPageTabsProps) {
  return (
    <div 
      className="border-t bg-white p-2 flex gap-2 items-center"
      data-ignore-deselect="true"
    >
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onSwitchPage(page.number)}
          className={`px-4 py-2 rounded ${
            currentPage === page.number
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          ページ {page.number}
        </button>
      ))}
      
      {/* 右端にページ削除ボタン */}
      <button
        onClick={() => {
          if (pages.length > 1 && confirm(`ページ ${currentPage} を削除しますか？`)) {
            onDeletePage(currentPage);
          }
        }}
        className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={pages.length === 1}
        title={pages.length === 1 ? "最後のページは削除できません" : "現在のページを削除"}
      >
        ページ削除
      </button>
    </div>
  );
}
