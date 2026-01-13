"use client";

interface TemplateDialogsProps {
  // 保存ダイアログ
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
  onSaveTemplate: () => void;

  // 保存オプションダイアログ
  showSaveOptions: boolean;
  setShowSaveOptions: (show: boolean) => void;
  setShowSaveAsDialog: (show: boolean) => void;
  onSaveOverwrite: () => void;

  // 名前変更して新規保存ダイアログ
  showSaveAsDialog: boolean;
  onSaveAsNew: () => void;

  // 未保存ダイアログ
  showUnsavedDialog: boolean;
  onDiscardAndProceed: () => void;
  onSaveAndProceed: () => void;
}

/**
 * TemplateDialogs
 * 保存ダイアログ、上書きダイアログ、名前変更ダイアログ、未保存ダイアログを担当
 */
export default function TemplateDialogs({
  showSaveDialog,
  setShowSaveDialog,
  templateName,
  setTemplateName,
  onSaveTemplate,
  showSaveOptions,
  setShowSaveOptions,
  setShowSaveAsDialog,
  onSaveOverwrite,
  showSaveAsDialog,
  onSaveAsNew,
  showUnsavedDialog,
  onDiscardAndProceed,
  onSaveAndProceed,
}: TemplateDialogsProps) {
  return (
    <>
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
                  onSaveTemplate();
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
                onClick={onSaveTemplate}
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
                onClick={onSaveOverwrite}
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
                  onSaveAsNew();
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
                onClick={onSaveAsNew}
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
                onClick={onDiscardAndProceed}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                保存しない
              </button>
              <button
                onClick={onSaveAndProceed}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
