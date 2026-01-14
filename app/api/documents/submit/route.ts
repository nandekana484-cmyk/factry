import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 承認申請（draft → pending）
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

    if (document.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft documents can be submitted" },
        { status: 400 }
      );
    }

    // トランザクションで状態変更と承認リクエスト作成
    await prisma.$transaction(async (tx) => {
      // 文書の状態を pending に更新
      await tx.document.update({
        where: { id: documentId },
        data: { status: "pending" },
      });

      // 承認リクエストを作成
      await tx.approvalRequest.create({
        data: {
          document_id: documentId,
          requester_id: userId,
          comment: comment || null,
        },
      });

      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: userId,
          action: "submitted",
          comment: comment || null,
        },
      });
    });

    return NextResponse.json({ ok: true, status: "pending" });
  } catch (error) {
    console.error("Submit for approval error:", error);
    return NextResponse.json(
      { error: "Failed to submit for approval" },
      { status: 500 }
    );
  }
}
