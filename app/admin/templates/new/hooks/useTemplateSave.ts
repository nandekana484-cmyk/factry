"use client";

import { useState, useCallback } from "react";

/**
 * useTemplateSave
 * テンプレート保存関連のロジックを担当
 */
export const useTemplateSave = ({
  editor,
  setIsDirty,
  setTemplateRefresh,
}: {
  editor: any;
  setIsDirty: (dirty: boolean) => void;
  setTemplateRefresh: (fn: (prev: number) => number) => void;
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // 保存ボタンを押した時の処理
  const handleSaveButtonClick = useCallback(() => {
    if (editor.selectedTemplateId) {
      // 既存テンプレート：保存オプション選択ダイアログを表示
      const templates = JSON.parse(localStorage.getItem("templates") || "[]");
      const currentTemplate = templates.find((t: any) => t.id === editor.selectedTemplateId);
      if (currentTemplate) {
        setTemplateName(currentTemplate.name);
      }
      setShowSaveOptions(true);
    } else {
      // 新規テンプレート：保存ダイアログを表示
      setTemplateName("");
      setShowSaveDialog(true);
    }
  }, [editor.selectedTemplateId]);

  // 新規保存処理
  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    editor.saveTemplate(templateName);
    setTemplateName("");
    setShowSaveDialog(false);
    setTemplateRefresh((prev) => prev + 1);
    setIsDirty(false);
  }, [editor, templateName, setTemplateRefresh, setIsDirty]);

  // 上書き保存処理（名前は変更しない）
  const handleSaveOverwrite = useCallback(() => {
    editor.saveTemplateOverwrite();
    setShowSaveOptions(false);
    setTemplateRefresh((prev) => prev + 1);
    setIsDirty(false);
  }, [editor, setTemplateRefresh, setIsDirty]);

  // 名前を変更して新規保存
  const handleSaveAsNew = useCallback(() => {
    if (!templateName.trim()) return;
    editor.saveTemplateAsNew(templateName);
    setTemplateName("");
    setShowSaveAsDialog(false);
    setShowSaveOptions(false);
    setTemplateRefresh((prev) => prev + 1);
    setIsDirty(false);
  }, [editor, templateName, setTemplateRefresh, setIsDirty]);

  return {
    showSaveDialog,
    setShowSaveDialog,
    showSaveOptions,
    setShowSaveOptions,
    showSaveAsDialog,
    setShowSaveAsDialog,
    templateName,
    setTemplateName,
    handleSaveButtonClick,
    handleSaveTemplate,
    handleSaveOverwrite,
    handleSaveAsNew,
  };
};
