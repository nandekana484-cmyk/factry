"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EditorContainer from "@/components/EditorContainer";
import PropertyEditor from "@/components/PropertyEditor";
import AIChat from "@/components/AIChat";
import { useEditor } from "@/lib/useEditor";
import { parseTableFromHTML } from "@/lib/tableParser";

export default function WriterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    blocks,
    updateBlock,
    selectedBlock,
    selectBlock,
    deleteBlock,
    selectedCell,
    setSelectedCell,
    loadTemplate,
    addTableBlock,
    addBlock,
    selectedTemplateId,
    newTemplate,
    setAllBlocks,
  } = useEditor();

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftDocuments, setDraftDocuments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [pages, setPages] = useState<Array<{ pageNumber: number; blocks: any[] }>>([{ pageNumber: 1, blocks: [] }]);
  const [currentPage, setCurrentPage] = useState(1);

  // URLパラメータからテンプレートIDを取得して読み込む
  useEffect(() => {
    const id = searchParams.get("templateId");
    if (id) {
      setTemplateId(id);
      loadTemplate(id);
      // テンプレート読み込み時にページを初期化（1ページ目のみ）
      setPages([{ pageNumber: 1, blocks: [] }]);
      setCurrentPage(1);
    } else {
      newTemplate();
    }
  }, [searchParams, loadTemplate, newTemplate]);

  // blocks が更新されたら currentPage のページに反映
  useEffect(() => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      const pageIndex = newPages.findIndex((p) => p.pageNumber === currentPage);
      if (pageIndex !== -1) {
        newPages[pageIndex] = { pageNumber: currentPage, blocks: [...blocks] };
      }
      return newPages;
    });
  }, [blocks, currentPage]);

  // テンプレート一覧と下書き一覧を取得
  useEffect(() => {
    // テンプレート一覧
    const storedTemplates = localStorage.getItem("templates");
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }

    // 下書き一覧（提出済みでない文書）
    const storedDrafts = localStorage.getItem("draftDocuments");
    if (storedDrafts) {
      setDraftDocuments(JSON.parse(storedDrafts));
    }
  }, []);

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

  // ペースト処理（HTMLテーブル検出）
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "text/html") {
        const html = e.clipboardData?.getData("text/html");
        if (html) {
          const parsedTable = parseTableFromHTML(html);
          if (parsedTable) {
            // HTMLテーブルを検出した場合、デフォルト動作をキャンセル
            e.preventDefault();

            // テーブルブロックを追加
            const lastBlock = blocks[blocks.length - 1];
            const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
            addTableBlock(parsedTable.cells, 100, newY);
            setIsDirty(true);

            return;
          }
        }
      }
    }
  };

  // グローバル paste イベント登録
  useEffect(() => {
    document.addEventListener("paste", handlePaste as EventListener);
    return () => {
      document.removeEventListener("paste", handlePaste as EventListener);
    };
  }, [blocks, addTableBlock]);

  // 保存処理
  const handleSubmitDocument = async () => {
    setIsSaving(true);
    try {
      // ドキュメント提出処理（後で実装）
      // 現在はダミー実装
      setTimeout(() => {
        setIsDirty(false);
        setIsSaving(false);
        alert("ドキュメントを提出しました");
        router.push("/dashboard/documents");
      }, 1000);
    } catch (error) {
      console.error("提出エラー:", error);
      setIsSaving(false);
    }
  };

  // 保存してから次のアクションを実行
  const handleSaveAndProceed = () => {
    handleSubmitDocument();
    setIsDirty(false);
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
    }
  };

  // 保存しないで次のアクションを実行
  const handleDiscardAndProceed = () => {
    setIsDirty(false);
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
    }
  };

  // 戻るボタン処理
  const handleGoBack = () => {
    if (isDirty) {
      setPendingAction(() => () => router.push("/dashboard/documents"));
      setShowUnsavedDialog(true);
    } else {
      router.push("/dashboard/documents");
    }
  };

  // AIから生成されたテキストを挿入
  const handleInsertAIText = (text: string) => {
    const lastBlock = blocks[blocks.length - 1];
    const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
    // テキストブロックを追加（type: "text"）
    addBlock("text");
    // 追加されたブロックにテキストを設定
    const newBlocks = [...blocks];
    if (newBlocks.length > 0) {
      const lastBlockId = newBlocks[newBlocks.length - 1].id;
      updateBlock(lastBlockId, { 
        label: text, 
        y: newY 
      });
      setIsDirty(true);
    }
  };

  // AIから生成された表を追加
  const handleInsertAITable = (cells: any[][]) => {
    const lastBlock = blocks[blocks.length - 1];
    const newY = lastBlock ? lastBlock.y + lastBlock.height + 20 : 100;
    addTableBlock(cells, 100, newY);
    setIsDirty(true);
  };

  // テキストブロックを追加
  const handleAddTextBlock = () => {
    addBlock("text");
    setIsDirty(true);
  };

  const handleAddPage = () => {
    const newPageNumber = pages.length + 1;
    setPages([...pages, { pageNumber: newPageNumber, blocks: [] }]);
    setCurrentPage(newPageNumber);
    setAllBlocks([]);
    setIsDirty(true);
  };

  const handleSwitchPage = (pageNumber: number) => {
    const page = pages.find((p) => p.pageNumber === pageNumber);
    if (page) {
      setCurrentPage(pageNumber);
      setAllBlocks(page.blocks);
    }
  };

  // テンプレートを読み込む
  const handleLoadTemplate = (templateId: string) => {
    if (isDirty) {
      if (confirm("編集内容が失われますが、テンプレートを読み込みますか？")) {
        loadTemplate(templateId);
        setIsDirty(false);
      }
    } else {
      loadTemplate(templateId);
    }
  };

  // 下書きを読み込む
  const handleLoadDraft = (draft: any) => {
    if (isDirty) {
      if (confirm("編集内容が失われますが、下書きを読み込みますか？")) {
        if (draft.pages) {
          setPages(draft.pages);
          setCurrentPage(1);
          setAllBlocks(draft.pages[0]?.blocks || []);
        } else {
          setPages([{ pageNumber: 1, blocks: draft.blocks || [] }]);
          setCurrentPage(1);
          setAllBlocks(draft.blocks || []);
        }
        setIsDirty(false);
      }
    } else {
      if (draft.pages) {
        setPages(draft.pages);
        setCurrentPage(1);
        setAllBlocks(draft.pages[0]?.blocks || []);
      } else {
        setPages([{ pageNumber: 1, blocks: draft.blocks || [] }]);
        setCurrentPage(1);
        setAllBlocks(draft.blocks || []);
      }
    }
  };

  const setBlocks = (newBlocks: any[]) => {
    // useEditor から blocks を更新する方法を追加する必要があるため
    // 一時的な実装
    console.log("setBlocks called", newBlocks);
  };

  return (
    <div className="flex h-screen gap-0">
      {/* 左：ツールパネル */}
      <div className="w-64 border-r overflow-y-auto p-4 bg-gray-50">
        {/* 戻るボタン */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            disabled={isSaving}
            className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 戻る
          </button>
        </div>

        {/* セクション1: 未提出文書 */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">未提出文書</h3>
          {draftDocuments.length === 0 ? (
            <p className="text-xs text-gray-500">下書きはありません</p>
          ) : (
            <div className="space-y-2">
              {draftDocuments.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => handleLoadDraft(draft)}
                  className="w-full text-left px-3 py-2 text-xs border rounded hover:bg-white hover:border-blue-400 transition"
                >
                  <div className="font-medium">{draft.title || "無題"}</div>
                  <div className="text-gray-500 text-xs">
                    {new Date(draft.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* セクション2: テンプレート選択 */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">テンプレート</h3>
          {templates.length === 0 ? (
            <p className="text-xs text-gray-500">テンプレートがありません</p>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleLoadTemplate(template.id)}
                  className="w-full text-left px-3 py-2 text-xs border rounded hover:bg-white hover:border-blue-400 transition"
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* セクション3: テキスト追加 */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">ブロック追加</h3>
          <button
            onClick={handleAddTextBlock}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
          >
            + テキストを追加
          </button>
        </div>

        {/* セクション4: ページ追加 */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">ページ管理</h3>
          <button
            onClick={handleAddPage}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
          >
            + ページ追加
          </button>
          <div className="mt-2 text-xs text-gray-600">
            現在: {currentPage} / {pages.length} ページ
          </div>
        </div>
      </div>

      {/* 中央：エディタ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* ページタブ */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b overflow-x-auto">
          <span className="text-sm font-semibold text-gray-600 mr-2">ページ:</span>
          {pages.map((page) => (
            <button
              key={page.pageNumber}
              onClick={() => handleSwitchPage(page.pageNumber)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                currentPage === page.pageNumber
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page.pageNumber}
            </button>
          ))}
        </div>

        <EditorContainer
          blocks={blocks}
          selectedBlock={selectedBlock}
          updateBlock={(id: string, updated: any) => {
            updateBlock(id, updated);
            setIsDirty(true);
          }}
          selectBlock={selectBlock}
          deleteBlock={deleteBlock}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
          onSaveTemplate={() => {}} // writerでは保存ダイアログなし
          onNewTemplate={() => {}}
        />
      </div>

      {/* 右：AIチャット欄（固定幅） */}
      <div className="w-80 border-l flex flex-col bg-white">
        <AIChat
          onInsertText={handleInsertAIText}
          onInsertTable={handleInsertAITable}
          blocks={blocks}
          onSubmit={handleSubmitDocument}
          isSaving={isSaving}
        />
      </div>

      {/* 未保存内容の確認ダイアログ */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">入力内容が保存されていません</h3>
            <p className="text-sm text-gray-600 mb-6">
              入力内容が保存されていません。提出しますか？
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleDiscardAndProceed}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                提出しない
              </button>
              <button
                onClick={handleSaveAndProceed}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                提出する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
