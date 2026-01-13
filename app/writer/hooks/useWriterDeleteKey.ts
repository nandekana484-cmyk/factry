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
      if (e.key === "Delete" && selectedBlock) {
        // 編集中のブロックは削除しない
        if (selectedBlock.isEditing) {
          return;
        }
        e.preventDefault();
        deleteBlock(selectedBlock.id);
        setIsDirty(true);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlock, deleteBlock, setIsDirty]);
};
