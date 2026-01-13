"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWriterEditor } from "@/lib/useWriterEditor";
import { useWriterPaste } from "./hooks/useWriterPaste";
import { useWriterDeleteKey } from "./hooks/useWriterDeleteKey";
import { useWriterLoader, useTemplateLoadHandler, useDraftLoadHandler } from "./hooks/useWriterLoader";
import { useWriterActions } from "./hooks/useWriterActions";
import WriterSidebar from "./components/WriterSidebar";
import WriterPageTabs from "./components/WriterPageTabs";
import WriterCanvas from "./components/WriterCanvas";
import WriterUnsavedDialog from "./components/WriterUnsavedDialog";
import AIChat from "@/components/AIChat";

export default function WriterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editor = useWriterEditor();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [draftDocuments, setDraftDocuments] = useState<any[]>([]);
  
  // 編集補助機能のstate
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapMode, setSnapMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  // クライアント側でのみlocalStorageからデータを読み込む
  useEffect(() => {
    const loadedTemplates = JSON.parse(localStorage.getItem("templates") || "[]");
    setTemplates(loadedTemplates);

    const documents = JSON.parse(localStorage.getItem("documents") || "[]");
    const drafts = documents.filter((doc: any) => doc.status === "draft");
    setDraftDocuments(drafts);
  }, []);

  // URLパラメータからテンプレートIDを取得して読み込む
  const templateId = searchParams.get("templateId");
  useWriterLoader(templateId, editor.loadTemplate);

  // ペースト処理
  useWriterPaste(editor.blocks, editor.addTableBlock, setIsDirty);

  // Deleteキー処理
  useWriterDeleteKey(editor.selectedBlock, editor.deleteBlock, setIsDirty);

  // アクションハンドラー
  const actions = useWriterActions(editor, setIsDirty, setIsSaving);

  // テンプレート・下書き読み込みハンドラー
  const handleLoadTemplate = useTemplateLoadHandler(isDirty, editor.loadTemplate, setIsDirty);
  const handleLoadDraft = useDraftLoadHandler(isDirty, editor.loadDraft, setIsDirty);

  // 戻るボタンハンドラー
  const handleGoBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      router.push("/dashboard/documents");
    }
  };

  // ブロック更新ハンドラー
  const handleUpdateBlock = (id: string, updated: any) => {
    editor.updateBlock(id, updated);
    setIsDirty(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左サイドバー */}
      <WriterSidebar
        isSaving={isSaving}
        onGoBack={handleGoBack}
        onSaveDraft={actions.handleSaveDraft}
        onSubmitDocument={actions.handleSubmitDocument}
        onAddTextBlock={actions.handleAddTextBlock}
        onAddPage={actions.handleAddPage}
        templates={templates}
        draftDocuments={draftDocuments}
        onLoadTemplate={handleLoadTemplate}
        onLoadDraft={handleLoadDraft}
      />

      {/* 中央エディタエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ページタブ */}
        <WriterPageTabs
          pages={editor.pages}
          currentPage={editor.currentPage}
          onSwitchPage={actions.handleSwitchPage}
        />

        {/* エディタエリア */}
        <WriterCanvas
          blocks={editor.blocks}
          selectedBlock={editor.selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onSelectBlock={editor.selectBlock}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          gridSize={gridSize}
          setGridSize={setGridSize}
          snapMode={snapMode}
          setSnapMode={setSnapMode}
          zoom={zoom}
          setZoom={setZoom}
          paper={editor.paper}
          orientation={editor.orientation}
        />
      </div>

      {/* 右：AIチャット */}
      <div 
        className="border-l"
        style={{
          width: "384px",
          flex: "0 0 384px",
          minWidth: "384px",
          maxWidth: "384px"
        }}
      >
        <AIChat
          blocks={editor.blocks}
          onInsertText={actions.handleInsertAIText}
          onInsertTable={actions.handleInsertAITable}
          onSubmit={actions.handleSubmitDocument}
          isSaving={isSaving}
        />
      </div>

      {/* 未保存ダイアログ */}
      <WriterUnsavedDialog
        show={showUnsavedDialog}
        onDiscard={() => {
          setShowUnsavedDialog(false);
          setIsDirty(false);
          router.push("/dashboard/documents");
        }}
        onCancel={() => setShowUnsavedDialog(false)}
        onSave={() => {
          actions.handleSaveDraft();
          setShowUnsavedDialog(false);
          router.push("/dashboard/documents");
        }}
      />
    </div>
  );
}
