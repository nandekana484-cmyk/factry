"use client";

import { useState, useCallback } from "react";

/**
 * useTemplateLoad
 * テンプレート読み込み・削除・新規作成を担当
 */
export const useTemplateLoad = ({
  editor,
  isDirty,
  setIsDirty,
  setTemplateName,
  setTemplateRefresh,
}: {
  editor: any;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  setTemplateName: (name: string) => void;
  setTemplateRefresh: (fn: (prev: number) => number) => void;
}) => {
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // テンプレート読み込み
  const handleLoadTemplate = useCallback((templateId: string) => {
    if (isDirty) {
      setPendingAction(() => () => editor.loadTemplate(templateId));
      setShowUnsavedDialog(true);
    } else {
      editor.loadTemplate(templateId);
    }
  }, [isDirty, editor]);

  // テンプレート削除
  const handleDeleteTemplate = useCallback((templateId: string) => {
    // 削除されたテンプレートが現在編集中のものだったら新規作成モードにする
    if (editor.selectedTemplateId === templateId) {
      editor.newTemplate();
      setIsDirty(false);
    }
    setTemplateRefresh((prev) => prev + 1);
  }, [editor, setIsDirty, setTemplateRefresh]);

  // 新規作成処理
  const handleNewTemplate = useCallback(() => {
    if (isDirty) {
      setPendingAction(() => () => {
        editor.newTemplate();
        setTemplateName("");
      });
      setShowUnsavedDialog(true);
    } else {
      editor.newTemplate();
      setTemplateName("");
    }
  }, [isDirty, editor, setTemplateName]);

  return {
    showUnsavedDialog,
    setShowUnsavedDialog,
    pendingAction,
    handleLoadTemplate,
    handleDeleteTemplate,
    handleNewTemplate,
  };
};
