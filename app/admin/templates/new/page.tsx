"use client";

import { useState } from "react";
import { useTemplateEditor } from "@/lib/useTemplateEditor";
import { useTemplateSave } from "./hooks/useTemplateSave";
import { useTemplateLoad } from "./hooks/useTemplateLoad";
import { useTemplateUnsavedGuard } from "./hooks/useTemplateUnsavedGuard";
import { LeftSidebar } from "./components/TemplateSidebar";
import RightSidebar from "./components/RightSidebar";
import TemplateDialogs from "./components/TemplateDialogs";
import TemplateCanvas from "./components/TemplateCanvas";

/**
 * TemplateCreatePage
 * テンプレート作成ページの最上位コンポーネント
 * 
 * 責務:
 * - レイアウト構成
 * - hooks呼び出し
 * - 状態管理の統合
 * - コンポーネント配置
 */
export default function TemplateCreatePage() {
  const editor = useTemplateEditor();

  const [templateRefresh, setTemplateRefresh] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // 保存関連のhooks
  const {
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
  } = useTemplateSave({
    editor,
    setIsDirty,
    setTemplateRefresh,
  });

  // 読み込み・削除・新規作成関連のhooks
  const {
    showUnsavedDialog: showLoadUnsavedDialog,
    setShowUnsavedDialog: setShowLoadUnsavedDialog,
    pendingAction,
    handleLoadTemplate,
    handleDeleteTemplate,
    handleNewTemplate,
  } = useTemplateLoad({
    editor,
    isDirty,
    setIsDirty,
    setTemplateName,
    setTemplateRefresh,
  });

  // 未保存ガード関連のhooks
  const {
    showUnsavedDialog,
    handleSaveAndProceed,
    handleDiscardAndProceed,
  } = useTemplateUnsavedGuard({
    editor,
    isDirty,
    templateName,
    setIsDirty,
    showUnsavedDialog: showLoadUnsavedDialog,
    setShowUnsavedDialog: setShowLoadUnsavedDialog,
    pendingAction,
  });

  return (
    <div className="flex h-screen gap-0 overflow-hidden">
      {/* 左サイドバー：FieldPalette */}
      <LeftSidebar editor={editor} setIsDirty={setIsDirty} />

      {/* 中央：エディタキャンバス */}
      <TemplateCanvas
        editor={editor}
        setIsDirty={setIsDirty}
        onSaveTemplate={handleSaveButtonClick}
        onNewTemplate={handleNewTemplate}
      />

      {/* 右サイドバー：TemplateList + PropertyEditor */}
      <RightSidebar
        editor={editor}
        setIsDirty={setIsDirty}
        templateRefresh={templateRefresh}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      {/* ダイアログ群 */}
      <TemplateDialogs
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        templateName={templateName}
        setTemplateName={setTemplateName}
        onSaveTemplate={handleSaveTemplate}
        showSaveOptions={showSaveOptions}
        setShowSaveOptions={setShowSaveOptions}
        setShowSaveAsDialog={setShowSaveAsDialog}
        onSaveOverwrite={handleSaveOverwrite}
        showSaveAsDialog={showSaveAsDialog}
        onSaveAsNew={handleSaveAsNew}
        showUnsavedDialog={showUnsavedDialog}
        onDiscardAndProceed={handleDiscardAndProceed}
        onSaveAndProceed={handleSaveAndProceed}
      />
    </div>
  );
}
