import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 差し戻し（checking/pending → draft）
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

      // checking または pending のみ差し戻し可能
      if (document.status !== "checking" && document.status !== "pending") {
        throw new Error("Only checking or pending documents can be rejected");
      }

      // checking 状態の場合は確認者のみ、pending 状態の場合は承認者のみが実行可能
      if (document.approvalRequest) {
        if (document.status === "checking" && document.approvalRequest.checker_id !== user.id) {
          throw new Error("Only the assigned checker can reject documents in checking status");
        }
        if (document.status === "pending" && document.approvalRequest.approver_id !== user.id) {
          throw new Error("Only the assigned approver can reject documents in pending status");
        }
      }

      // 文書の状態を draft に戻す
      await tx.document.update({
        where: { id: documentId },
        data: { status: "draft" },
      });

      // 承認リクエストを削除
      if (document.approvalRequest) {
        await tx.approvalRequest.delete({
          where: { document_id: documentId },
        });
      }

      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "rejected",
          comment: comment || null,
        },
      });

      return { status: "draft" };
    });

    return NextResponse.json({ ok: true, status: result.status });
  } catch (error: any) {
    console.error("Reject document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Approver role required") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === "Document not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === "Only pending documents can be rejected") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to reject document" },
      { status: 500 }
    );
  }
}
