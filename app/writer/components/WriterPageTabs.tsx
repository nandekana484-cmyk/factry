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
}

/**
 * WriterPageTabs
 * ページタブの UI を担当
 */
export default function WriterPageTabs({
  pages,
  currentPage,
  onSwitchPage,
}: WriterPageTabsProps) {
  return (
    <div 
      className="border-b bg-white p-2 flex gap-2"
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
    </div>
  );
}
