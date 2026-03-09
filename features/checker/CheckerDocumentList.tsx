import type { Document } from "@/types/document";
import { CheckerDocumentCard } from "./CheckerDocumentCard";

interface Props {
  documents: Document[];
  onView: (id: number) => void;
  onConfirm: (id: number, comment?: string) => void;
  onReject: (id: number, comment: string) => void;
}

export function CheckerDocumentList({ documents, onView, onConfirm, onReject }: Props) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        文書はありません
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <CheckerDocumentCard
          key={doc.id}
          document={doc}
          onView={onView}
          onConfirm={onConfirm}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
