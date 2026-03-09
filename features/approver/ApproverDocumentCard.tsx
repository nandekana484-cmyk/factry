
import type { Document, ApprovalHistoryItem } from "../../types/document";
import { formatRelativeTime } from "./utils/formatRelativeTime";
import { getActionBadge } from "./utils/getActionBadge";
import { getActionLabel } from "./utils/getActionLabel";
import { truncateText } from "./utils/truncateText";

interface Props {
  document: Document;
  latestHistory?: ApprovalHistoryItem;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  previewed: boolean;
}

export function ApproverDocumentCard({
  document,
  latestHistory,
  selected,
  onSelect,
  onPreview,
  previewed,
}: Props) {
  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer ${
        previewed ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onPreview}
    >
      <div className="flex items-start gap-3">
        {/* チェックボックス */}
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* 本文 */}
        <div className="flex-1 min-w-0">
          {/* タイトル + バッジ */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {document.title || "無題の文書"}
            </h3>

            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {document.latestRevision &&
                document.latestRevision.revisionSymbol !== "R0" && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
                    改定版
                  </span>
                )}
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                承認待ち
              </span>
            </div>
          </div>

          {/* メタ情報 */}
          <div className="text-sm text-gray-600 space-y-1 mb-3">
            <p>作成者: {document.creator.name || document.creator.email}</p>

            {document.approvalRequest && (
              <>
                <p>
                  確認者:{" "}
                  {document.approvalRequest.checker.name ||
                    document.approvalRequest.checker.email}
                </p>
                <p>
                  承認者:{" "}
                  {document.approvalRequest.approver.name ||
                    document.approvalRequest.approver.email}
                </p>
              </>
            )}

            <p>作成日: {formatRelativeTime(document.createdAt)}</p>

            {document.latestRevision && (
              <>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    {document.latestRevision.managementNumber || "未承認"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                    {document.latestRevision.revisionSymbol}
                  </span>
                </p>

                {document.latestRevision.approvedBy && (
                  <p className="text-xs">
                    前回承認者: {document.latestRevision.approvedBy.name}
                  </p>
                )}
              </>
            )}
          </div>

          {/* 最新履歴 */}
          {latestHistory && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${getActionBadge(
                    latestHistory.action
                  )}`}
                >
                  {getActionLabel(latestHistory.action)}
                </span>

                <span className="text-gray-600">
                  {latestHistory.user.name || latestHistory.user.email}
                </span>

                <span className="text-gray-500">
                  {formatRelativeTime(latestHistory.createdAt)}
                </span>
              </div>

              {latestHistory.comment && (
                <p className="text-gray-700">
                  {truncateText(latestHistory.comment, 50)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}