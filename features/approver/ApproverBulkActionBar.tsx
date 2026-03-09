interface Props {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
}

export function ApproverBulkActionBar({ selectedCount, onApprove, onReject }: Props) {
  if (selectedCount === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{selectedCount}件選択中</span>
      <button
        onClick={onApprove}
        className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
      >
        一括承認
      </button>
      <button
        onClick={onReject}
        className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
      >
        一括差し戻し
      </button>
    </div>
  );
}