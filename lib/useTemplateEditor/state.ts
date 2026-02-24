import { useState } from "react";
import type { Block, Page } from "./types";

export function useTemplateEditorState() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [history, setHistory] = useState<Page[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [gridSize, setGridSize] = useState(20);
  const [snapMode, setSnapMode] = useState(true);
  return {
    pages, setPages,
    currentPage, setCurrentPage,
    blocks, setBlocks,
    selectedBlock, setSelectedBlock,
    selectedCell, setSelectedCell,
    paper, setPaper,
    orientation, setOrientation,
    currentTemplateId, setCurrentTemplateId,
    history, setHistory,
    historyIndex, setHistoryIndex,
    isUndoRedoing, setIsUndoRedoing,
    showGrid, setShowGrid,
    zoom, setZoom,
    gridSize, setGridSize,
    snapMode, setSnapMode,
  };
}
