"use client";

import { useEffect } from "react";
import { parseTableFromHTML } from "@/lib/tableParser";

/**
 * useWriterPaste
 * HTMLテーブルのペースト処理を担当
 */
export const useWriterPaste = (
  blocks: any[],
  addTableBlock: (cells: any[][], x: number, y: number) => void,
  setIsDirty: (dirty: boolean) => void
) => {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type === "text/html") {
          const html = e.clipboardData?.getData("text/html");
          if (html) {
            const parsedTable = parseTableFromHTML(html);
            if (parsedTable) {
              e.preventDefault();
              const lastBlock = blocks[blocks.length - 1];
              const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
              addTableBlock(parsedTable.cells, 100, newY);
              setIsDirty(true);
              return;
            }
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste as EventListener);
    return () => {
      document.removeEventListener("paste", handlePaste as EventListener);
    };
  }, [blocks, addTableBlock, setIsDirty]);
};
