import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAssignWorkflowRole } from "@/lib/auth";
import { UserRole } from "@/types/document";

// 確認処理（checking → pending）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { documentId, comment } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 文書の状態を確認
      const document = await tx.document.findUnique({
        where: { id: documentId },
        include: { approvalRequest: true },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      if (!document.approvalRequest) {
        throw new Error("Approval request not found");
      }

      // 確認者のみ実行可能
      if (document.approvalRequest.checker_id !== user.id || !canAssignWorkflowRole(user.role, "checker")) {
        throw new Error("Only the assigned checker can check this document");
      }

      // 作成者は確認できない
      if (document.creator_id === user.id) {
        throw new Error("Creator cannot check their own document");
      }

      // checking状態のみ確認可能
      if (document.status !== "checking") {
        throw new Error("Only checking documents can be checked");
      }

      // 文書の状態を pending に更新
      await tx.document.update({
        where: { id: documentId },
        data: { status: "pending" },
      });

      // ApprovalRequestのchecked_atを更新
      await tx.approvalRequest.update({
        where: { document_id: documentId },
        data: { checked_at: new Date() },
      });

      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "checked",
          comment: comment || null,
        },
      });

      return { status: "pending" };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Check document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      error.message === "Document not found" ||
      error.message === "Approval request not found"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === "Only the assigned checker can check this document" ||
      error.message === "Creator cannot check their own document" ||
      error.message === "Only checking documents can be checked"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to check document" },
      { status: 500 }
    );
  }
}
