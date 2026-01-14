"use client";

import { useEffect } from "react";

/**
 * useWriterDeleteKey
 * Deleteキーでブロック削除する処理を担当
 */
export const useWriterDeleteKey = (
  selectedBlock: any,
  deleteBlock: (id: string) => void,
  setIsDirty: (dirty: boolean) => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 編集中のブロックではキー操作を無視
      if (selectedBlock?.isEditing) {
        return;
      }

      if (e.key === "Delete" && selectedBlock) {
        e.preventDefault();
        deleteBlock(selectedBlock.id);
        setIsDirty(true);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlock, deleteBlock, setIsDirty]);
};
