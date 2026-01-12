"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEditor } from "@/lib/useEditor";
import { usePageManager } from "@/lib/usePageManager";
import { useTemplateManager } from "@/lib/useTemplateManager";
import { useUnsavedGuard } from "@/lib/useUnsavedGuard";
import { parseTableFromHTML } from "@/lib/tableParser";
import WriterLayout from "@/components/writer/WriterLayout";
import WriterSidebar from "@/components/writer/WriterSidebar";
import PageTabs from "@/components/writer/PageTabs";
import EditorArea from "@/components/writer/EditorArea";
import AIChatArea from "@/components/writer/AIChatArea";
import UnsavedDialog from "@/components/writer/UnsavedDialog";

export default function WriterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  // カスタムフック
  const editor = useEditor();
  const page = usePageManager();
  const templateManager = useTemplateManager();
  const guard = useUnsavedGuard();

  // URLパラメータからテンプレートIDを取得して読み込む
  useEffect(() => {
    const id = searchParams.get("templateId");
    if (id) {
      editor.loadTemplate(id);
      page.resetToSinglePage();
    } else {
      editor.newTemplate();
    }
  }, [searchParams]);

  // blocks が更新されたら currentPage のページに反映
  useEffect(() => {
    page.updateCurrentPageBlocks(editor.blocks);
  }, [editor.blocks]);

  // ペースト処理（HTMLテーブル検出）
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
              const lastBlock = editor.blocks[editor.blocks.length - 1];
              const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
              editor.addTableBlock(parsedTable.cells, 100, newY);
              guard.markDirty();
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
  }, [editor.blocks, editor.addTableBlock, guard]);

  // ハンドラー関数
  const handleSubmitDocument = async () => {
    setIsSaving(true);
    try {
      // ドキュメント提出処理（後で実装）
      setTimeout(() => {
        guard.markClean();
        setIsSaving(false);
        alert("ドキュメントを提出しました");
        router.push("/dashboard/documents");
      }, 1000);
    } catch (error) {
      console.error("提出エラー:", error);
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    guard.guardAction(() => router.push("/dashboard/documents"));
  };

  const handleInsertAIText = (text: string) => {
    const lastBlock = editor.blocks[editor.blocks.length - 1];
    const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
    editor.addBlock("text");
    const newBlocks = [...editor.blocks];
    if (newBlocks.length > 0) {
      const lastBlockId = newBlocks[newBlocks.length - 1].id;
      editor.updateBlock(lastBlockId, { label: text, y: newY });
      guard.markDirty();
    }
  };

  const handleInsertAITable = (cells: any[][]) => {
    const lastBlock = editor.blocks[editor.blocks.length - 1];
    const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
    editor.addTableBlock(cells, 100, newY);
    guard.markDirty();
  };

  const handleAddTextBlock = () => {
    editor.addBlock("text");
    guard.markDirty();
  };

  const handleAddPage = () => {
    const newPageNumber = page.addPage();
    page.switchPage(newPageNumber);
    editor.setAllBlocks([]);
    guard.markDirty();
  };

  const handleSwitchPage = (pageNumber: number) => {
    const blocks = page.switchPage(pageNumber);
    if (blocks !== null) {
      editor.setAllBlocks(blocks);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    if (guard.confirmLoad("編集内容が失われますが、テンプレートを読み込みますか？")) {
      editor.loadTemplate(templateId);
      guard.markClean();
    }
  };

  const handleLoadDraft = (draft: any) => {
    if (guard.confirmLoad("編集内容が失われますが、下書きを読み込みますか？")) {
      if (draft.pages) {
        const blocks = page.loadPages(draft.pages);
        editor.setAllBlocks(blocks);
      } else {
        page.resetToSinglePage();
        editor.setAllBlocks(draft.blocks || []);
      }
      guard.markClean();
    }
  };

  return (
    <WriterLayout
      sidebar={
        <WriterSidebar
          templates={templateManager.templates}
          draftDocuments={templateManager.draftDocuments}
          isSaving={isSaving}
          onGoBack={handleGoBack}
          onLoadTemplate={handleLoadTemplate}
          onLoadDraft={handleLoadDraft}
          onAddTextBlock={handleAddTextBlock}
          onAddPage={handleAddPage}
          currentPage={page.currentPage}
          totalPages={page.pages.length}
        />
      }
      tabs={
        <PageTabs
          pages={page.pages}
          currentPage={page.currentPage}
          onSwitchPage={handleSwitchPage}
        />
      }
      editor={
        <EditorArea
          blocks={editor.blocks}
          selectedBlock={editor.selectedBlock}
          selectedCell={editor.selectedCell}
          onUpdateBlock={(id: string, updated: any) => {
            editor.updateBlock(id, updated);
            guard.markDirty();
          }}
          onSelectBlock={editor.selectBlock}
          onDeleteBlock={editor.deleteBlock}
          onSetSelectedCell={editor.setSelectedCell}
        />
      }
      ai={
        <AIChatArea
          blocks={editor.blocks}
          isSaving={isSaving}
          onInsertText={handleInsertAIText}
          onInsertTable={handleInsertAITable}
          onSubmit={handleSubmitDocument}
        />
      }
      unsavedDialog={
        <UnsavedDialog
          show={guard.showUnsavedDialog}
          onDiscard={guard.discardAndProceed}
          onSave={() => guard.saveAndProceed(handleSubmitDocument)}
        />
      }
    />
  );
}
