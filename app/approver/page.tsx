"use client";

import { useRouter } from "next/navigation";
import { useApproverDashboard } from "@/features/approver/useApproverDashboard";
import { canAssignWorkflowRole } from "@/lib/role";

import { ApproverDashboardHeader } from "@/features/approver/ApproverDashboardHeader";
import { ApproverBulkActionBar } from "@/features/approver/ApproverBulkActionBar";
import { ApproverDocumentList } from "@/features/approver/ApproverDocumentList";
import { ApproverPreviewPane } from "@/features/approver/ApproverPreviewPane";
import { ApproverActionModal } from "@/features/approver/ApproverActionModal";

export default function ApproverDashboardPage() {
  const router = useRouter();
  const state = useApproverDashboard();

  const {
    currentUser,
    loading,
    error,
    sortedDocuments,
    historyMap,
    selectedIds,
    previewDocId,
    previewDoc,
    previewLoading,
    modalOpen,
    modalAction,
    modalDocumentIds,
    modalComment,

    setSortKey,
    setSortOrder,
    setPreviewDocId,
    setModalComment,

    toggleSelect,
    toggleSelectAll,
    openModal,
    closeModal,
    handleCheckAction,
    handleExecuteAction,
  } = state;

  // --- ローディング中 ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // --- 権限チェック ---
  if (!currentUser || !canAssignWorkflowRole(currentUser.role, "approver")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            権限がありません
          </div>
          <p className="text-gray-600 mb-4">
            この機能は承認者のみアクセス可能です
          </p>
          <button
            onClick={() => router.push("/documents")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            文書一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // --- メインUI ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <ApproverDashboardHeader
            user={currentUser}
            error={error}
            onBack={() => router.push("/documents")}
          />

          {/* ソート + バルク操作 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">ソート:</label>
              <select
                value={state.sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">作成日</option>
                <option value="title">タイトル</option>
                <option value="creator">作成者</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(state.sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
              >
                {state.sortOrder === "asc" ? "↑ 昇順" : "↓ 降順"}
              </button>
            </div>

            <ApproverBulkActionBar
              selectedCount={selectedIds.size}
              onApprove={() => openModal("approve", Array.from(selectedIds))}
              onReject={() => openModal("reject", Array.from(selectedIds))}
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {sortedDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            承認待ちの文書はありません
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApproverDocumentList
              documents={sortedDocuments}
              historyMap={historyMap}
              selectedIds={selectedIds}
              onSelect={toggleSelect}
              onSelectAll={toggleSelectAll}
              onPreview={setPreviewDocId}
              previewDocId={previewDocId}
            />

            {/* プレビュー */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <div className="bg-white rounded-lg shadow h-full overflow-auto">
                <ApproverPreviewPane
                  previewDoc={previewDoc}
                  loading={previewLoading}
                  currentUser={currentUser}
                  onCheck={() => handleCheckAction(previewDocId!)}
                  onApprove={() => openModal("approve", [previewDocId!])}
                  onReject={() => openModal("reject", [previewDocId!])}
                  onHistory={() =>
                    router.push(`/documents/${previewDocId}/history`)
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* モーダル */}
      <ApproverActionModal
        open={modalOpen}
        action={modalAction}
        documentIds={modalDocumentIds}
        comment={modalComment}
        onChangeComment={setModalComment}
        onCancel={closeModal}
        onSubmit={handleExecuteAction}
        error={error}
      />
    </div>
  );
}