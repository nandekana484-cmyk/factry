"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FieldPalette from "@/components/FieldPalette";
import PropertyEditor from "@/components/PropertyEditor";
import TemplateList from "@/components/TemplateList";
import EditorContainer from "@/components/EditorContainer";
import { useEditor } from "@/lib/useEditor";

export default function TemplateCreatePage() {
  const router = useRouter();
  const {
    blocks,
    addBlock,
    updateBlock,
    selectedBlock,
    selectBlock,
    deleteBlock,
    selectedCell,
    setSelectedCell,
    saveTemplate,
    saveTemplateOverwrite,
    saveTemplateAsNew,
    loadTemplate,
    selectedTemplateId,
    newTemplate,
  } = useEditor();

  const [templateRefresh, setTemplateRefresh] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
  const handleSaveAndProceed = async () => {
    if (selectedTemplateId) {
      saveTemplateOverwrite();
    } else if (templateName.trim()) {
      saveTemplate(templateName);
    }
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

  // 保存ボタンを押した時の処理
  const handleSaveButtonClick = () => {
    if (selectedTemplateId) {
      // 既存テンプレート：保存オプション選択ダイアログを表示
      const templates = JSON.parse(localStorage.getItem("templates") || "[]");
      const currentTemplate = templates.find((t: any) => t.id === selectedTemplateId);
      if (currentTemplate) {
        setTemplateName(currentTemplate.name);
      }
      setShowSaveOptions(true);
    } else {
      // 新規テンプレート：保存ダイアログを表示
      setTemplateName("");
      setShowSaveDialog(true);
    }
  };

  // 新規保存処理
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate(templateName);
    setTemplateName("");
    setShowSaveDialog(false);
    setTemplateRefresh((prev) => prev + 1);
    setIsDirty(false);
  };

  // 上書き保存処理（名前は変更しない）
  const handleSaveOverwrite = () => {
    saveTemplateOverwrite();
    setShowSaveOptions(false);
    setTemplateRefresh((prev) => prev + 1);
    setIsDirty(false);
  };

  // 名前を変更して新規保存
  const handleSaveAsNew = () => {
    if (!templateName.trim()) return;
    saveTemplateAsNew(templateName);
    setTemplateName("");
    setShowSaveAsDialog(false);
    setShowSaveOptions(false);
    setTemplateRefresh((prev) => prev + 1);
    setIsDirty(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    if (isDirty) {
      setPendingAction(() => () => loadTemplate(templateId));
      setShowUnsavedDialog(true);
    } else {
      loadTemplate(templateId);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    // 削除されたテンプレートが現在編集中のものだったら新規作成モードにする
    if (selectedTemplateId === templateId) {
      newTemplate();
      setIsDirty(false);
    }
    setTemplateRefresh((prev) => prev + 1);
  };

  // 新規作成処理
  const handleNewTemplate = () => {
    if (isDirty) {
      setPendingAction(() => () => {
        newTemplate();
        setTemplateName("");
      });
      setShowUnsavedDialog(true);
    } else {
      newTemplate();
      setTemplateName("");
    }
  };

  // 戻るボタン処理
  const handleGoBack = () => {
    if (isDirty) {
      setPendingAction(() => () => router.push("/admin/templates"));
      setShowUnsavedDialog(true);
    } else {
      router.push("/admin/templates");
    }
  };

  return (
    <div className="flex h-screen gap-0">

      {/* 左：フィールドパレット */}
      <div className="w-64 border-r overflow-y-auto">
        <FieldPalette onAdd={(type, role) => {
          addBlock(type, role);
          setIsDirty(true);
        }} />
      </div>

      {/* 中央：エディタ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <EditorContainer
          blocks={blocks}
          selectedBlock={selectedBlock}
          updateBlock={(id: string, updated: any) => {
            updateBlock(id, updated);
            setIsDirty(true);
          }}
          selectBlock={selectBlock}
          deleteBlock={(id: string) => {
            deleteBlock(id);
            setIsDirty(true);
          }}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
          onSaveTemplate={handleSaveButtonClick}
          onNewTemplate={handleNewTemplate}
        />
      </div>

      {/* 右：テンプレート一覧（上）＋ プロパティ編集（中央〜下） */}
      <div className="w-80 border-l flex flex-col">

        {/* 上段：テンプレート一覧（小さく） */}
        <div className="h-32 border-b overflow-y-auto">
          <TemplateList 
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            refreshKey={templateRefresh}
            selectedTemplateId={selectedTemplateId}
          />
        </div>

        {/* 中央〜下段：プロパティ編集（大きく） */}
        <div className="flex-1 min-h-0 overflow-y-auto border-t">
          <PropertyEditor 
            block={selectedBlock} 
            onUpdate={(id: string, updated: any) => {
              updateBlock(id, updated);
              setIsDirty(true);
            }}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
          />
        </div>

      </div>

      {/* 保存ダイアログ（新規保存） */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">新規テンプレート保存</h3>
            <input
              type="text"
              placeholder="テンプレート名を入力"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTemplate();
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 上書き保存確認ダイアログ */}
      {showSaveOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">テンプレートの保存方法を選択</h3>
            <p className="text-sm text-gray-600 mb-6">
              既存の「{templateName}」テンプレートをどのように保存しますか？
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveOptions(false);
                  setTemplateName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setShowSaveAsDialog(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                名前を変更して新規保存
              </button>
              <button
                onClick={handleSaveOverwrite}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                上書き保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 名前を変更して新規保存ダイアログ */}
      {showSaveAsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">名前を変更して新規保存</h3>
            <p className="text-sm text-gray-600 mb-4">
              新しいテンプレート名を入力してください
            </p>
            <input
              type="text"
              placeholder="新しいテンプレート名"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveAsNew();
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveAsDialog(false);
                  setTemplateName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveAsNew}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                新規保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 未保存内容の確認ダイアログ */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">編集内容が保存されていません</h3>
            <p className="text-sm text-gray-600 mb-6">
              編集内容が保存されていません。保存しますか？
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleDiscardAndProceed}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                保存しない
              </button>
              <button
                onClick={handleSaveAndProceed}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
