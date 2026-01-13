"use client";

import { useEffect, useCallback } from "react";

/**
 * useTemplateUnsavedGuard
 * 未保存ガード（beforeunload と unsaved dialog）を担当
 */
export const useTemplateUnsavedGuard = ({
  editor,
  isDirty,
  setIsDirty,
  templateName,
  showUnsavedDialog,
  setShowUnsavedDialog,
  pendingAction,
}: {
  editor: any;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  templateName: string;
  showUnsavedDialog: boolean;
  setShowUnsavedDialog: (show: boolean) => void;
  pendingAction: (() => void) | null;
}) => {
  // beforeunload イベント（ブラウザを閉じる/リロード時の警告）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "編集内容が保存されていません。このページを離れると変更内容は失われます。";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 保存してから次のアクションを実行
  const handleSaveAndProceed = useCallback(async () => {
    if (editor.selectedTemplateId) {
      editor.saveTemplateOverwrite();
    } else if (templateName.trim()) {
      editor.saveTemplate(templateName);
    }
    setIsDirty(false);
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
    }
  }, [editor, templateName, setIsDirty, setShowUnsavedDialog, pendingAction]);

  // 保存しないで次のアクションを実行
  const handleDiscardAndProceed = useCallback(() => {
    setIsDirty(false);
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
    }
  }, [setIsDirty, setShowUnsavedDialog, pendingAction]);

  return {
    showUnsavedDialog,
    handleSaveAndProceed,
    handleDiscardAndProceed,
  };
};
