"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/document";
import { canAssignWorkflowRole } from "@/lib/role";

interface Document {
  id: number;
  title: string;
  status: "draft" | "checking" | "pending" | "approved";
  managementNumber?: string | null;
  creator: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
  approvalRequest?: {
    id: number;
    requester: {
      id: number;
      name?: string;
      email: string;
    };
    checker: {
      id: number;
      name?: string;
      email: string;
    };
    approver: {
      id: number;
      name?: string;
      email: string;
    };
    requested_at: string;
    checked_at: string | null;
    comment: string | null;
  };
  latestRevision?: {
    id: number;
    managementNumber: string;
    revisionSymbol: string;
    approvedBy: { id: number; name: string } | null;
    approvedAt: string | null;
  } | null;

  blockCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
}

export default function CheckerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"checking" | "pending">("checking");
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/login");
        return;
      }

      const userData = await response.json();
      setUser(userData);

      // 確認待ちと承認待ちの両方を取得
      const docsResponse = await fetch("/api/documents");
      if (docsResponse.ok) {
        const data = await docsResponse.json();
        // checking または pending のみフィルタ
        const filtered = data.documents.filter(
          (doc: Document) =>
            (doc.status === "checking" || doc.status === "pending") &&
            doc.approvalRequest &&
            (doc.approvalRequest.checker.id === userData.id ||
              doc.approvalRequest.approver.id === userData.id)
        );
        setDocuments(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (documentId: number) => {
    if (!confirm("この文書を確認しますか？")) return;

    const comment = prompt("コメントを入力してください（任意）");

    try {
      const response = await fetch("/api/documents/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, comment }),
      });

      if (response.ok) {
        alert("確認しました");
        fetchDocuments();
      } else {
        const error = await response.json();
        alert(`確認に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error("Confirm failed:", error);
      alert("確認に失敗しました");
    }
  };

  const handleApprove = async (documentId: number) => {
    if (!confirm("この文書を承認しますか？")) return;

    const comment = prompt("コメントを入力してください（任意）");

    try {
      const response = await fetch("/api/documents/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, comment }),
      });

      if (response.ok) {
        alert("承認しました");
        fetchDocuments();
      } else {
        const error = await response.json();
        alert(`承認に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error("Approve failed:", error);
      alert("承認に失敗しました");
    }
  };

  const handleReject = async (documentId: number) => {
    if (!confirm("この文書を差し戻しますか？")) return;

    const comment = prompt("差し戻し理由を入力してください");
    if (!comment) {
      alert("差し戻し理由は必須です");
      return;
    }

    try {
      const response = await fetch("/api/documents/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, comment }),
      });

      if (response.ok) {
        alert("差し戻しました");
        fetchDocuments();
      } else {
        const error = await response.json();
        alert(`差し戻しに失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error("Reject failed:", error);
      alert("差し戻しに失敗しました");
    }
  };

  const handleViewDocument = (documentId: number) => {
    router.push(`/documents/${documentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const checkingDocs = documents.filter(
    (doc) =>
      doc.status === "checking" &&
      doc.approvalRequest?.checker.id === user.id
  );

  const pendingDocs = documents.filter(
    (doc) =>
      doc.status === "pending" &&
      doc.approvalRequest?.approver.id === user.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              確認・承認ダッシュボード
            </h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブ */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("checking")}
              className={`${
                activeTab === "checking"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              確認待ち ({checkingDocs.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              承認待ち ({pendingDocs.length})
            </button>
          </nav>
        </div>

        {/* 確認待ちタブ */}
        {activeTab === "checking" && (
          <div className="space-y-4">
            {checkingDocs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                確認待ちの文書はありません
              </div>
            ) : (
              checkingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {doc.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          作成者: {doc.creator.name || doc.creator.email}
                        </p>
                        <p>
                          申請日時:{" "}
                          {new Date(
                            doc.approvalRequest!.requested_at
                          ).toLocaleString("ja-JP")}
                        </p>
                        {doc.approvalRequest?.comment && (
                          <p className="text-gray-700 mt-2">
                            コメント: {doc.approvalRequest.comment}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      確認待ち
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDocument(doc.id)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      内容を確認
                    </button>
                    <button
                      onClick={() => handleConfirm(doc.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      確認する
                    </button>
                    <button
                      onClick={() => handleReject(doc.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      差し戻す
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 承認待ちタブ */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingDocs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                承認待ちの文書はありません
              </div>
            ) : (
              pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {doc.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          作成者: {doc.creator.name || doc.creator.email}
                        </p>
                        <p>
                          確認者:{" "}
                          {doc.approvalRequest?.checker.name ||
                            doc.approvalRequest?.checker.email}
                        </p>
                        <p>
                          確認日時:{" "}
                          {doc.approvalRequest?.checked_at
                            ? new Date(
                                doc.approvalRequest.checked_at
                              ).toLocaleString("ja-JP")
                            : "未確認"}
                        </p>
                        <p>
                          申請日時:{" "}
                          {new Date(
                            doc.approvalRequest!.requested_at
                          ).toLocaleString("ja-JP")}
                        </p>
                        {doc.approvalRequest?.comment && (
                          <p className="text-gray-700 mt-2">
                            コメント: {doc.approvalRequest.comment}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      承認待ち
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDocument(doc.id)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      内容を確認
                    </button>
                    <button
                      onClick={() => handleApprove(doc.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      承認する
                    </button>
                    <button
                      onClick={() => handleReject(doc.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      差し戻す
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
