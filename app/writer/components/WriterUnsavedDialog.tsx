"use client";

interface WriterUnsavedDialogProps {
  show: boolean;
  onDiscard: () => void;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * WriterUnsavedDialog
 * 未保存ダイアログを担当
 */
export default function WriterUnsavedDialog({
  show,
  onDiscard,
  onCancel,
  onSave,
}: WriterUnsavedDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-lg font-bold mb-4">編集内容が保存されていません</h3>
        <p className="text-sm text-gray-600 mb-6">
          編集内容が保存されていません。保存しますか？
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onDiscard}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            保存しない
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
