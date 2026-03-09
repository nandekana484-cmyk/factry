
import { ApproverDocumentCard } from "@/features/approver/ApproverDocumentCard";

import type { Document } from "@/types/document";
import type { ApprovalHistoryItem } from "@/types/document";

interface Props {
  documents: Document[];
  historyMap: Record<number, ApprovalHistoryItem[]>;
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onPreview: (id: number) => void;
  previewDocId: number | null;
}
export function ApproverDocumentList({
  documents,
  historyMap,
  selectedIds,
  onSelect,
  onSelectAll,
  onPreview,
  previewDocId,
}: Props) {
  return (
    <div className="space-y-4">
      {/* 全選択 */}
      <div className="bg-white rounded-lg shadow p-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={documents.length > 0 && selectedIds.size === documents.length}
          onChange={onSelectAll}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700 font-medium">すべて選択</label>
      </div>

      {/* 文書カード一覧 */}
      {documents.map((doc) => {
        const latestHistory = historyMap[doc.id]?.[0];

        return (
          <ApproverDocumentCard
            key={doc.id}
            document={doc}
            latestHistory={latestHistory}
            selected={selectedIds.has(doc.id)}
            onSelect={() => onSelect(doc.id)}
            onPreview={() => onPreview(doc.id)}
            previewed={previewDocId === doc.id}
          />
        );
      })}
    </div>
  );
}

// ApproverDocumentCardは別ファイルで定義