import type { Page, Block } from "./types";
import { nanoid } from "nanoid";

export function usePageActions(state: any) {
  const { pages, setPages, currentPage, setCurrentPage, blocks, setBlocks, setSelectedBlock, setSelectedCell } = state;

  // ページ追加
  const addPage = () => {
    const newPageNumber = pages.length + 1;
    const newPage: Page = {
      id: nanoid(),
      number: newPageNumber,
      blocks: [],
    };
    setPages((prev: Page[]) => [...prev, newPage]);
    return newPageNumber;
  };

  // ページ削除
  const deletePage = (pageNumber: number) => {
    if (pageNumber === 1 || pages.length === 1) return false;
    setPages((prev: Page[]) => prev.map((p: Page) => p.number === currentPage ? { ...p, blocks: [...blocks] } : p));
    setPages((prev: Page[]) => {
      const filtered = prev.filter((p: Page) => p.number !== pageNumber);
      return filtered.map((p: Page, index: number) => ({ ...p, number: index + 1 }));
    });
    if (currentPage === pageNumber) {
      const newCurrentPage = Math.max(1, pageNumber - 1);
      setTimeout(() => {
        switchPage(newCurrentPage);
      }, 0);
    } else if (currentPage > pageNumber) {
      setCurrentPage((prev: number) => prev - 1);
    }
    return true;
  };

  // ページ切り替え
  const switchPage = (pageNumber: number) => {
    setPages((prev: Page[]) => prev.map((p: Page) => p.number === currentPage ? { ...p, blocks: [...blocks] } : p));
    const targetPage = pages.find((p: Page) => p.number === pageNumber);
    if (targetPage) {
      setCurrentPage(pageNumber);
      setBlocks([...targetPage.blocks]);
      setSelectedBlock(null);
      setSelectedCell(null);
      return targetPage.blocks;
    }
    return null;
  };

  // ページ初期化
  const resetToSinglePage = () => {
    setPages((prev: Page[]) => prev.length === 0 ? [{ id: nanoid(), number: 1, blocks: [] }] : prev);
    setCurrentPage(1);
    setBlocks([]);
    setSelectedBlock(null);
    setSelectedCell(null);
  };

  // ページ群を読み込み
  const loadPages = (loadedPages: Page[]) => {
    if (loadedPages && loadedPages.length > 0) {
      setPages(loadedPages);
      setCurrentPage(1);
      setBlocks([...loadedPages[0].blocks]);
      setSelectedBlock(null);
      setSelectedCell(null);
      return loadedPages[0].blocks;
    }
    return [];
  };

  return {
    addPage,
    deletePage,
    switchPage,
    resetToSinglePage,
    loadPages,
  };
}
