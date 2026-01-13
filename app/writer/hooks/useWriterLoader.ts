"use client";

import { useEffect } from "react";

/**
 * useWriterLoader
 * テンプレートID・下書きの読み込み処理を担当
 */
export const useWriterLoader = (
  templateId: string | null,
  loadTemplate: (id: string) => void
) => {
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId, loadTemplate]);
};

/**
 * テンプレート読み込みハンドラー
 */
export const useTemplateLoadHandler = (
  isDirty: boolean,
  loadTemplate: (id: string) => void,
  setIsDirty: (dirty: boolean) => void
) => {
  return (templateId: string) => {
    if (isDirty && !confirm("編集内容が失われますが、テンプレートを読み込みますか？")) {
      return;
    }
    loadTemplate(templateId);
    setIsDirty(false);
  };
};

/**
 * 下書き読み込みハンドラー
 */
export const useDraftLoadHandler = (
  isDirty: boolean,
  loadDraft: (draft: any) => any,
  setIsDirty: (dirty: boolean) => void,
  setDocumentTitle: (title: string) => void
) => {
  return (draft: any) => {
    if (isDirty && !confirm("編集内容が失われますが、下書きを読み込みますか？")) {
      return;
    }
    loadDraft(draft);
    setDocumentTitle(draft.title || "");
    setIsDirty(false);
  };
};
