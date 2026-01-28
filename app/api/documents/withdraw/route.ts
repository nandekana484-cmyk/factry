import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 引き戻し（pending → draft、作成者が実行）
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

      // 作成者のみ実行可能
      if (document.creator_id !== user.id) {
        throw new Error("Only the creator can withdraw the document");
      }

      // checking または pending のみ引き戻し可能
      if (document.status !== "checking" && document.status !== "pending") {
        throw new Error("Only checking or pending documents can be withdrawn");
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
          action: "withdrawn",
          comment: comment || null,
        },
      });

      return { status: "draft" };
    });

    return NextResponse.json({ ok: true, status: result.status });
  } catch (error: any) {
    console.error("Withdraw document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Document not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === "Only the creator can withdraw the document" ||
      error.message === "Only pending documents can be withdrawn"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to withdraw document" },
      { status: 500 }
    );
  }
}
