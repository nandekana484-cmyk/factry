import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 差し戻し（pending → draft、承認者が実行）
export async function POST(req: Request) {
  try {
    const { documentId, userId, comment } = await req.json();

    // 文書の状態を確認
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { approvalRequest: true },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending documents can be rejected" },
        { status: 400 }
      );
    }

    // トランザクションで状態変更と承認リクエスト削除
    await prisma.$transaction(async (tx) => {
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
          user_id: userId,
          action: "rejected",
          comment: comment || null,
        },
      });
    });

    return NextResponse.json({ ok: true, status: "draft" });
  } catch (error) {
    console.error("Reject document error:", error);
    return NextResponse.json(
      { error: "Failed to reject document" },
      { status: 500 }
    );
  }
}
