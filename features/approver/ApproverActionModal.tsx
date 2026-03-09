interface Props {
  open: boolean;
  action: "approve" | "reject" | null;
  documentIds: number[];
  comment: string;
  onChangeComment: (v: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error?: string;
}

export function ApproverActionModal({ open, action, documentIds, comment, onChangeComment, onCancel, onSubmit, error }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {action === "approve" ? "承認" : "差し戻し"}
          {documentIds.length > 1 && ` (${documentIds.length}件)`}
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コメント
            {action === "reject" && <span className="text-red-500 ml-1">（必須）</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => onChangeComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder={action === "approve" ? "承認コメントを入力（任意）" : "差し戻しの理由を入力してください"}
          />
        </div>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium">キャンセル</button>
          <button onClick={onSubmit} className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>{action === "approve" ? "承認する" : "差し戻す"}</button>
        </div>
      </div>
    </div>
  );
}