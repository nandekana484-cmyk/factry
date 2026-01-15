import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 確認処理（pending → checking）
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

      // 確認者または承認者のみ実行可能
      const isChecker = (document.approvalRequest as any).checker_id === user.id;
      const isApprover = (document.approvalRequest as any).approver_id === user.id;
      
      if (!isChecker && !isApprover) {
        throw new Error("Only the assigned checker or approver can check this document");
      }

      // 作成者は確認できない
      if (document.creator_id === user.id) {
        throw new Error("Creator cannot check their own document");
      }

      if (document.status !== "pending") {
        throw new Error("Only pending documents can be checked");
      }

      // 文書の状態を checking に更新
      await tx.document.update({
        where: { id: documentId },
        data: { status: "checking" },
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

      return { status: "checking" };
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
      error.message === "Only the assigned checker or approver can check this document" ||
      error.message === "Creator cannot check their own document" ||
      error.message === "Only pending documents can be checked"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to check document" },
      { status: 500 }
    );
  }
}
