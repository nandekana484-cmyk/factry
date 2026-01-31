import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAssignWorkflowRole } from "@/lib/auth";
import { UserRole } from "@/types/document";

// 承認申請（draft → pending）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { documentId, checkerId, approverId, comment } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    if (!checkerId || !approverId) {
      return NextResponse.json(
        { error: "checkerId and approverId are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 文書の状態を確認
      const document = await tx.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      // 作成者のみ実行可能
      if (document.creator_id !== user.id || !canAssignWorkflowRole(user.role, "creator")) {
        throw new Error("Only creator can submit this document");
      }

      // checker/approverのroleチェック
      const checkerUser = await tx.user.findUnique({ where: { id: checkerId } });
      if (!checkerUser || !canAssignWorkflowRole(checkerUser.role, "checker")) {
        throw new Error("Invalid checker role");
      }
      const approverUser = await tx.user.findUnique({ where: { id: approverId } });
      if (!approverUser || !canAssignWorkflowRole(approverUser.role, "approver")) {
        throw new Error("Invalid approver role");
      }

      if (document.status !== "draft") {
        throw new Error("Only draft documents can be submitted");
      }

      // 文書の状態を checking に更新（確認待ち）
      // フォルダIDと文書種別IDは draft 時に設定済み
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "checking",
        },
      });

      // 承認リクエストを作成
      await tx.approvalRequest.create({
        data: {
          document_id: documentId,
          requester_id: user.id,
          checker_id: checkerId,
          approver_id: approverId,
          comment: comment || null,
        },
      });

      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "submitted",
          comment: comment || null,
        },
      });

      return { status: "checking" };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Submit for approval error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Document not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === "Only creator can submit this document" ||
      error.message === "Only draft documents can be submitted"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to submit for approval" },
      { status: 500 }
    );
  }
}
