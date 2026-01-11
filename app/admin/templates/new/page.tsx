"use client";

import { useState } from "react";
import FieldPalette from "@/components/FieldPalette";
import PropertyEditor from "@/components/PropertyEditor";
import TemplateList from "@/components/TemplateList";
import EditorContainer from "@/components/EditorContainer";
import { useEditor } from "@/lib/useEditor";

export default function TemplateCreatePage() {
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
    loadTemplate,
    selectedTemplateId,
    newTemplate,
  } = useEditor();

  const [templateRefresh, setTemplateRefresh] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // 保存ボタンを押した時の処理
  const handleSaveButtonClick = () => {
    if (selectedTemplateId) {
      // 上書き保存の場合：確認ダイアログを表示
      const templates = JSON.parse(localStorage.getItem("templates") || "[]");
      const currentTemplate = templates.find((t: any) => t.id === selectedTemplateId);
      if (currentTemplate) {
        setTemplateName(currentTemplate.name);
      }
      setShowOverwriteConfirm(true);
    } else {
      // 新規保存の場合：保存ダイアログを表示
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
  };

  // 上書き保存処理
  const handleOverwriteTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplateOverwrite(templateName);
    setTemplateName("");
    setShowOverwriteConfirm(false);
    setTemplateRefresh((prev) => prev + 1);
  };

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // 削除されたテンプレートが現在編集中のものだったら新規作成モードにする
    if (selectedTemplateId === templateId) {
      newTemplate();
    }
    setTemplateRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen gap-0">

      {/* 左：フィールドパレット */}
      <div className="w-64 border-r overflow-y-auto">
        <FieldPalette onAdd={addBlock} />
      </div>

      {/* 中央：エディタ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <EditorContainer
          blocks={blocks}
          selectedBlock={selectedBlock}
          updateBlock={updateBlock}
          selectBlock={selectBlock}
          deleteBlock={deleteBlock}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
          onSaveTemplate={handleSaveButtonClick}
          onNewTemplate={newTemplate}
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
            onUpdate={updateBlock}
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
      {showOverwriteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">テンプレートを上書き保存</h3>
            <p className="text-sm text-gray-600 mb-4">
              このテンプレートを上書き保存しますか？
            </p>
            <input
              type="text"
              placeholder="テンプレート名"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleOverwriteTemplate();
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowOverwriteConfirm(false);
                  setTemplateName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleOverwriteTemplate}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                上書き保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
