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
import WriterPropertyBox from "@/components/WriterPropertyBox";
import AIChat from "@/components/AIChat";
import FolderSelectModal from "./components/FolderSelectModal";

export default function WriterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editor = useWriterEditor();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showPropertyBox, setShowPropertyBox] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [draftDocuments, setDraftDocuments] = useState<any[]>([]);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  
  // 編集補助機能のstate
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapMode, setSnapMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  // ログイン状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          console.warn("認証エラー: ログインページにリダイレクトします");
          router.push("/login");
        } else {
          const data = await response.json();
          console.log("ログイン中のユーザー:", data.user);
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // クライアント側でのみlocalStorageからデータを読み込む
  useEffect(() => {
    const loadedTemplates = JSON.parse(localStorage.getItem("templates") || "[]");
    setTemplates(loadedTemplates);

    const documents = JSON.parse(localStorage.getItem("documents") || "[]");
    const drafts = documents.filter((doc: any) => doc.status === "draft");
    setDraftDocuments(drafts);

    // 文書種別リストを取得
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch("/api/document-types");
        if (response.ok) {
          const data = await response.json();
          setDocumentTypes(data.documentTypes || []);
        }
      } catch (error) {
        console.error("Failed to fetch document types:", error);
      }
    };
    fetchDocumentTypes();

    // フォルダーリストを取得
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/folders");
        if (response.ok) {
          const data = await response.json();
          setFolders(data.folders || []);
        }
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      }
    };
    fetchFolders();
  }, []);

  // URLパラメータからdocumentIdを取得して文書を読み込む
  const documentId = searchParams.get("documentId");
  useEffect(() => {
    if (documentId) {
      const loadDocument = async () => {
        try {
          const response = await fetch(`/api/documents/${documentId}`);
          if (response.ok) {
            const data = await response.json();
            const doc = data.document;
            
            // 文書データを editor に読み込む
            editor.setAllBlocks(doc.blocks || []);
            editor.setCurrentDocumentId(doc.id);
            
            console.log("文書を読み込みました:", doc.title);
          } else {
            console.error("文書の読み込みに失敗しました");
            alert("文書の読み込みに失敗しました");
          }
        } catch (error) {
          console.error("文書読み込みエラー:", error);
          alert("文書の読み込みに失敗しました");
        }
      };
      loadDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // URLパラメータからテンプレートIDを取得して読み込む
  const templateId = searchParams.get("templateId");
  useWriterLoader(templateId, editor.loadTemplate);

  // ペースト処理
  useWriterPaste(editor.blocks, editor.addTableBlock, setIsDirty);

  // Deleteキー処理
  useWriterDeleteKey(editor.selectedBlock, editor.deleteBlock, setIsDirty);

  // Undo/Redoキーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 編集中のブロックではショートカットを無効化
      if (editor.selectedBlock?.isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        editor.redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  // アクションハンドラー
  const actions = useWriterActions(
    editor, 
    setIsDirty, 
    setIsSaving, 
    selectedDocumentTypeId,
    selectedFolderId
  );

  // テンプレート・下書き読み込みハンドラー
  const handleLoadTemplate = useTemplateLoadHandler(isDirty, editor.loadTemplate, setIsDirty);
  const handleLoadDraft = useDraftLoadHandler(isDirty, editor.loadDraft, setIsDirty);

  // 戻るボタンハンドラー
  const handleGoBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      router.push("/writer/menu");
    }
  };

  // ブロック更新ハンドラー
  const handleUpdateBlock = (id: string, updated: any) => {
    editor.updateBlock(id, updated);
    setIsDirty(true);
  };

  return (
    <div className="flex h-screen overflow-hidden no-print-container">
      {/* 左サイドバー */}
      <div className="no-print">
        <WriterSidebar
          onGoBack={handleGoBack}
          onAddTextBlock={actions.handleAddTextBlock}
          onAddBlock={actions.handleAddBlock}
          onAddImage={(imageData) => {
            editor.addImageBlock(imageData);
            setIsDirty(true);
          }}
          onAddPage={actions.handleAddPage}
          templates={templates}
          draftDocuments={draftDocuments}
          onLoadTemplate={handleLoadTemplate}
          onLoadDraft={handleLoadDraft}
          documentTypes={documentTypes}
          selectedDocumentTypeId={selectedDocumentTypeId}
          onSelectDocumentType={setSelectedDocumentTypeId}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
        />
      </div>

      {/* 中央エディタエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
          currentPage={editor.currentPage}
          showPropertyBox={showPropertyBox}
          setShowPropertyBox={setShowPropertyBox}
          onSaveDraft={actions.handleSaveDraft}
          onOverwriteDraft={actions.handleOverwriteDraft}
          currentDocumentId={editor.currentDocumentId}
          onUndo={editor.undo}
          onRedo={editor.redo}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
        />

        {/* ページタブ（下部） */}
        <div className="no-print">
          <WriterPageTabs
            pages={editor.pages}
            currentPage={editor.currentPage}
            onSwitchPage={actions.handleSwitchPage}
            onDeletePage={actions.handleDeletePage}
          />
        </div>
      </div>

      {/* 右：AIチャット */}
      <div 
        className="border-l no-print"
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
          router.push("/writer/menu");
        }}
        onCancel={() => setShowUnsavedDialog(false)}
        onSave={() => {
          actions.handleSaveDraft();
          setShowUnsavedDialog(false);
          router.push("/writer/menu");
        }}
      />

      {/* プロパティボックス */}
      {showPropertyBox && (
        <WriterPropertyBox
          selectedBlock={editor.selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onClose={() => setShowPropertyBox(false)}
        />
      )}
    </div>
  );
}
