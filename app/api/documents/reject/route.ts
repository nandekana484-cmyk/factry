import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprover } from "@/lib/auth";

// 差し戻し（pending → draft、承認者が実行）
export async function POST(req: Request) {
  try {
    const user = await requireApprover();
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

      if (document.status !== "pending") {
        throw new Error("Only pending documents can be rejected");
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
