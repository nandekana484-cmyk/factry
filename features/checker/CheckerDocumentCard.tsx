import type { Document } from "@/types/document";
import { formatRelativeTime } from "./utils/formatRelativeTime";
import { getActionBadge } from "./utils/getActionBadge";
import { getActionLabel } from "./utils/getActionLabel";
import { truncateText } from "./utils/truncateText";

interface Props {
  document: Document;
  onView: (id: number) => void;
  onConfirm: (id: number, comment?: string) => void;
  onReject: (id: number, comment: string) => void;
}

export function CheckerDocumentCard({ document, onView, onConfirm, onReject }: Props) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {document.title}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>作成者: {document.creator.name || document.creator.email}</p>
            <p>申請日時: {formatRelativeTime(document.approvalRequest?.requested_at || document.createdAt)}</p>
            {document.approvalRequest?.comment && (
              <p className="text-gray-700 mt-2">
                コメント: {truncateText(document.approvalRequest.comment, 50)}
              </p>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getActionBadge(document.status)}`}>
          {getActionLabel(document.status)}
        </span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onView(document.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          内容を確認
        </button>
        <button onClick={() => onConfirm(document.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
          確認する
        </button>
        <button onClick={() => onReject(document.id, "理由なし")} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
          差し戻す
        </button>
      </div>
    </div>
  );
}
