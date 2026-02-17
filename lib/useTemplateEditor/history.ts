import { useCallback } from "react";
import type { Page } from "./types";

export function useHistoryActions(state: any) {
  const { pages, setPages, history, setHistory, historyIndex, setHistoryIndex, isUndoRedoing, setIsUndoRedoing, currentPage, setBlocks } = state;

  // 履歴に現在の状態を保存
  const saveToHistory = useCallback(() => {
    if (isUndoRedoing) return;
    const currentState = JSON.parse(JSON.stringify(pages));
    setHistory((prev: Page[][]) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev: number) => {
      const newIndex = prev + 1;
      return newIndex > 50 ? 50 : newIndex;
    });
  }, [pages, historyIndex, isUndoRedoing, setHistory, setHistoryIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    setIsUndoRedoing(true);
    const previousState = history[historyIndex - 1];
    setPages(JSON.parse(JSON.stringify(previousState)));
    setHistoryIndex(historyIndex - 1);
    const currentPageData = previousState.find((p: Page) => p.number === currentPage);
    if (currentPageData) {
      setBlocks([...currentPageData.blocks]);
    }
    setTimeout(() => setIsUndoRedoing(false), 0);
  }, [history, historyIndex, currentPage, setPages, setHistoryIndex, setBlocks, setIsUndoRedoing]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    setIsUndoRedoing(true);
    const nextState = history[historyIndex + 1];
    setPages(JSON.parse(JSON.stringify(nextState)));
    setHistoryIndex(historyIndex + 1);
    const currentPageData = nextState.find((p: Page) => p.number === currentPage);
    if (currentPageData) {
      setBlocks([...currentPageData.blocks]);
    }
    setTimeout(() => setIsUndoRedoing(false), 0);
  }, [history, historyIndex, currentPage, setPages, setHistoryIndex, setBlocks, setIsUndoRedoing]);

  return { saveToHistory, undo, redo };
}
