"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchCurrentUser } from "@/services/user.service";
import {
  fetchDocuments,
  fetchHistory,
  fetchDocumentDetail,
  handleCheck,
  executeAction,
} from "@/services/document.service";

import type {
  User,
  Document,
  DocumentDetail,
  ApprovalHistoryItem,
} from "@/types/document";

type SortKey = "createdAt" | "title" | "creator";
type SortOrder = "asc" | "desc";

export function useApproverDashboard() {
  // --- state ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<number, ApprovalHistoryItem[]>>({});
  const [previewDocId, setPreviewDocId] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [modalDocumentIds, setModalDocumentIds] = useState<number[]>([]);
  const [modalComment, setModalComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- fetch current user ---
  useEffect(() => {
    (async () => {
      const { user, error } = await fetchCurrentUser();
      setCurrentUser(user);
      setError(error || "");
      setLoading(false);
    })();
  }, []);

  // --- fetch documents & history ---
  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const { documents, error } = await fetchDocuments();
      setDocuments(documents);
      setError(error || "");

      if (documents.length > 0 && !previewDocId) {
        setPreviewDocId(documents[0].id);
      }

      documents.forEach(async (doc) => {
        const history = await fetchHistory(doc.id);
        setHistoryMap((prev) => ({ ...prev, [doc.id]: history }));
      });
    })();
  }, [currentUser]);

  // --- fetch preview detail ---
  useEffect(() => {
    if (!previewDocId) return;

    setPreviewLoading(true);
    (async () => {
      const detail = await fetchDocumentDetail(previewDocId);
      setPreviewDoc(detail);
      setPreviewLoading(false);
    })();
  }, [previewDocId]);

  // --- actions ---
  const handleCheckAction = async (documentId: number) => {
    const { success, error } = await handleCheck(documentId);
    if (!success) return setError(error || "確認処理に失敗しました");

    const { documents } = await fetchDocuments();
    setDocuments(documents);

    if (previewDocId === documentId) {
      const detail = await fetchDocumentDetail(documentId);
      setPreviewDoc(detail);
    }
  };

  const handleExecuteAction = async () => {
    if (!modalAction) return setError("アクションが選択されていません");
    const { success, error } = await executeAction(
      modalAction,
      modalDocumentIds,
      modalComment
    );

    if (!success) return setError(error || "処理に失敗しました");

    setDocuments((prev) =>
      prev.filter((doc) => !modalDocumentIds.includes(doc.id))
    );
    setSelectedIds(new Set());
    setModalOpen(false);

    if (modalDocumentIds.includes(previewDocId || -1)) {
      const remaining = documents.filter(
        (doc) => !modalDocumentIds.includes(doc.id)
      );
      setPreviewDocId(remaining.length > 0 ? remaining[0].id : null);
      setPreviewDoc(null);
    }
  };

  // --- sorting ---
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortKey) {
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "creator":
          aVal = (a.creator.name || a.creator.email).toLowerCase();
          bVal = (b.creator.name || b.creator.email).toLowerCase();
          break;
      }

      return sortOrder === "asc"
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1;
    });
  }, [documents, sortKey, sortOrder]);

  // --- selection ---
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedDocuments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedDocuments.map((doc) => doc.id)));
    }
  };

  // --- modal ---
  const openModal = (action: "approve" | "reject", ids: number[]) => {
    setModalAction(action);
    setModalDocumentIds(ids);
    setModalComment("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalDocumentIds([]);
    setModalComment("");
  };

  return {
    // state
    currentUser,
    loading,
    error,
    documents,
    sortedDocuments,
    historyMap,
    previewDocId,
    previewDoc,
    previewLoading,
    selectedIds,
    modalOpen,
    modalAction,
    modalDocumentIds,
    modalComment,
    sortKey,
    sortOrder,

    // setters
    setSortKey,
    setSortOrder,
    setPreviewDocId,
    setModalComment,

    // actions
    toggleSelect,
    toggleSelectAll,
    openModal,
    closeModal,
    handleCheckAction,
    handleExecuteAction,
  };
}