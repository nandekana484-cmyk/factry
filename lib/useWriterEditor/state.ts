import { useState } from "react";
import type { Block, Page } from "./types";

export function useWriterEditorState() {
  // テンプレートID管理
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  // ページ管理
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [blocks, setBlocks] = useState<Block[]>([]);
  // 選択状態
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  // 用紙サイズ
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  // 現在編集中の文書ID
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  // Undo/Redo用の履歴管理
  const [history, setHistory] = useState<Page[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);

  return {
    selectedTemplateId, setSelectedTemplateId,
    pages, setPages,
    currentPage, setCurrentPage,
    blocks, setBlocks,
    selectedBlock, setSelectedBlock,
    selectedCell, setSelectedCell,
    paper, setPaper,
    orientation, setOrientation,
    currentDocumentId, setCurrentDocumentId,
    history, setHistory,
    historyIndex, setHistoryIndex,
    isUndoRedoing, setIsUndoRedoing,
  };
}
