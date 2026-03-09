import type { DocumentDetail } from "@/types/document";
import { ApproverPreviewBlocks } from "@/features/approver/ApproverPreviewBlocks";
import { ApproverPreviewActions } from "@/features/approver/ApproverPreviewActions";

interface Props {
  previewDoc: DocumentDetail | null;
  loading: boolean;
  currentUser: any;
  onCheck: () => void;
  onApprove: () => void;
  onReject: () => void;
  onHistory: () => void;
}

export function ApproverPreviewPane({ previewDoc, loading, currentUser, onCheck, onApprove, onReject, onHistory }: Props) {
  if (loading) {
    return <div className="flex items-center justify-center h-full">読み込み中...</div>;
  }
  if (!previewDoc) {
    return <div className="flex items-center justify-center h-full text-gray-500">文書を選択してください</div>;
  }
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-900">{previewDoc.title || "無題の文書"}</h2>
          {previewDoc.latestRevision && previewDoc.latestRevision.revisionSymbol !== "R0" && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">改定版</span>
          )}
        </div>
        {/* ...その他の情報... */}
      </div>
      {/* ApproverPreviewBlocks, ApproverPreviewActions で分割 */}
      <ApproverPreviewBlocks blocks={previewDoc.blocks} />
      <ApproverPreviewActions
        previewDoc={previewDoc}
        currentUser={currentUser}
        onCheck={onCheck}
        onApprove={onApprove}
        onReject={onReject}
      />
      <button onClick={onHistory} className="w-full mt-3 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm">承認履歴を見る →</button>
    </div>
  );
}

// ApproverPreviewBlocks, ApproverPreviewActionsは別ファイルで定義