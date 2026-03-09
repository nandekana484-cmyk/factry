"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/document";
import { canAssignWorkflowRole } from "@/lib/role";

import type { Document, User, ApprovalRequestWithCheck, LatestRevision } from "@/types/document";


import { useCheckerDashboard } from "@/features/checker/useCheckerDashboard";
import { CheckerDocumentList } from "@/features/checker/CheckerDocumentList";
import { CheckerActionModal } from "@/features/checker/CheckerActionModal";



export default function CheckerPage() {
    // モーダル状態管理
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"confirm"|"approve"|"reject">("confirm");
    const [modalDocId, setModalDocId] = useState<number|null>(null);
    const [modalComment, setModalComment] = useState("");
    const [modalError, setModalError] = useState<string|undefined>(undefined);

    // モーダルを開く
    const openModal = (mode: "confirm"|"approve"|"reject", docId: number) => {
      setModalMode(mode);
      setModalDocId(docId);
      setModalComment("");
      setModalError(undefined);
      setModalOpen(true);
    };
    // モーダルを閉じる
    const closeModal = () => {
      setModalOpen(false);
      setModalDocId(null);
      setModalComment("");
      setModalError(undefined);
    };

    // モーダルからの確定アクション
    const handleModalSubmit = async () => {
      if (!modalDocId) return;
      let result;
      if (modalMode === "confirm") {
        result = await handleConfirm(modalDocId, modalComment);
      } else if (modalMode === "approve") {
        result = await handleApprove(modalDocId, modalComment);
      } else if (modalMode === "reject") {
        if (!modalComment.trim()) {
          setModalError("差し戻し理由を入力してください");
          return;
        }
        result = await handleReject(modalDocId, modalComment);
      }
      if (result?.success) {
        closeModal();
      } else {
        setModalError(result?.error || "エラーが発生しました");
      }
    };
  const {
    loading,
    user,
    activeTab,
    checkingDocs,
    pendingDocs,
    handleViewDocument,
    handleConfirm,
    handleApprove,
    handleReject,
    setActiveTab,
  } = useCheckerDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">確認・承認ダッシュボード</h1>
            <button onClick={() => window.location.href = "/dashboard"} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">ダッシュボードに戻る</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab("checking")} className={`${activeTab === "checking" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>確認待ち ({checkingDocs.length})</button>
            <button onClick={() => setActiveTab("pending")} className={`${activeTab === "pending" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>承認待ち ({pendingDocs.length})</button>
          </nav>
        </div>
        {activeTab === "checking" && (
          <CheckerDocumentList
            documents={checkingDocs}
            onView={handleViewDocument}
            onConfirm={(id) => openModal("confirm", id)}
            onReject={(id) => openModal("reject", id)}
          />
        )}
        {activeTab === "pending" && (
          <CheckerDocumentList
            documents={pendingDocs}
            onView={handleViewDocument}
            onConfirm={(id) => openModal("approve", id)}
            onReject={(id) => openModal("reject", id)}
          />
        )}
        <CheckerActionModal
          open={modalOpen}
          mode={modalMode}
          documentId={modalDocId}
          comment={modalComment}
          onChangeComment={setModalComment}
          onSubmit={handleModalSubmit}
          onCancel={closeModal}
          error={modalError}
        />
      </div>
    </div>
  );
}
