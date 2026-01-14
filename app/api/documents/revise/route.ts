import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 改定開始（approved → draft、作成者が実行）
export async function POST(req: Request) {
  try {
    const { documentId, userId, comment } = await req.json();

    // 文書の状態を確認
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved documents can be revised" },
        { status: 400 }
      );
    }

    if (document.creator_id !== userId) {
      return NextResponse.json(
        { error: "Only the creator can revise the document" },
        { status: 403 }
      );
    }

    // トランザクションで状態変更と履歴記録
    await prisma.$transaction(async (tx) => {
      // 文書の状態を draft に戻す
      await tx.document.update({
        where: { id: documentId },
        data: { status: "draft" },
      });

      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: userId,
          action: "revised",
          comment: comment || null,
        },
      });
    });

    return NextResponse.json({ ok: true, status: "draft" });
  } catch (error) {
    console.error("Revise document error:", error);
    return NextResponse.json(
      { error: "Failed to revise document" },
      { status: 500 }
    );
  }
}
