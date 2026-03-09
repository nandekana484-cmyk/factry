import type { DocumentDetail } from "@/types/document";

interface Props {
  previewDoc: DocumentDetail;
  currentUser: any;
  onCheck: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ApproverPreviewActions({ previewDoc, currentUser, onCheck, onApprove, onReject }: Props) {
  // 権限判定やボタン表示ロジックをここに集約
  return (
    <div className="space-y-3">
      {/* 確認者用ボタン */}
      {currentUser && previewDoc.approvalRequest &&
        (previewDoc.approvalRequest.checker.id === currentUser.id || previewDoc.approvalRequest.approver.id === currentUser.id) &&
        previewDoc.status === "pending" && (
          <div className="flex gap-3">
            <button onClick={onCheck} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">確認完了</button>
            <button onClick={onReject} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">差し戻し</button>
          </div>
        )}
      {/* 承認者用ボタン */}
      {currentUser && previewDoc.approvalRequest &&
        previewDoc.approvalRequest.approver.id === currentUser.id &&
        (previewDoc.status === "checking" || previewDoc.status === "pending") && (
          <div className="flex gap-3">
            <button onClick={onApprove} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">承認</button>
            <button onClick={onReject} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">差し戻し</button>
          </div>
        )}
      {/* 権限なし */}
      {currentUser && previewDoc.approvalRequest &&
        previewDoc.approvalRequest.checker.id !== currentUser.id &&
        previewDoc.approvalRequest.approver.id !== currentUser.id && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">この文書に対するアクション権限がありません</div>
        )}
    </div>
  );
}