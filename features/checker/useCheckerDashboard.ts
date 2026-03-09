import { useState, useEffect, useMemo } from "react";
import type { Document, User } from "@/types/document";
import { confirmDocument, approveDocument, rejectDocument } from "@/services/document.service";

export function useCheckerDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"checking" | "pending">("checking");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) return;
      const userData = await userRes.json();
      setUser(userData);
      const docsRes = await fetch("/api/documents");
      if (docsRes.ok) {
        const data = await docsRes.json();
        const filtered = data.documents.filter((doc: Document) =>
          (doc.status === "checking" || doc.status === "pending") &&
          doc.approvalRequest &&
          (doc.approvalRequest.checker.id === userData.id || doc.approvalRequest.approver.id === userData.id)
        );
        setDocuments(filtered);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (documentId: number, comment?: string) => {
    const result = await confirmDocument(documentId, comment);
    if (result.success) fetchDocuments();
    return result;
  };

  const handleApprove = async (documentId: number, comment?: string) => {
    const result = await approveDocument(documentId, comment);
    if (result.success) fetchDocuments();
    return result;
  };

  const handleReject = async (documentId: number, comment: string) => {
    const result = await rejectDocument(documentId, comment);
    if (result.success) fetchDocuments();
    return result;
  };

  const checkingDocs = useMemo(() =>
    documents.filter(
      (doc) => doc.status === "checking" && doc.approvalRequest?.checker.id === user?.id
    ),
    [documents, user]
  );

  const pendingDocs = useMemo(() =>
    documents.filter(
      (doc) => doc.status === "pending" && doc.approvalRequest?.approver.id === user?.id
    ),
    [documents, user]
  );

  const handleViewDocument = (documentId: number) => {
    window.location.href = `/documents/${documentId}`;
  };

  return {
    documents,
    user,
    loading,
    activeTab,
    checkingDocs,
    pendingDocs,
    fetchDocuments,
    handleConfirm,
    handleApprove,
    handleReject,
    handleViewDocument,
    setActiveTab,
  };
}
