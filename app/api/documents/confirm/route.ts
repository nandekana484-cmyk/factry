import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/documents/confirm
 * 確認者（checker）が文書を確認し、承認者への承認待ちに移行する
 * checking → pending
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);

    const body = await request.json();
    const { documentId, comment } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // トランザクション処理
    const result = await prisma.$transaction(async (tx) => {
      // 文書の取得
      const doc = await tx.document.findUnique({
        where: { id: documentId },
        include: {
          approvalRequest: true,
        },
      });

      if (!doc) {
        throw new Error("Document not found");
      }

      // ステータスチェック
      if (doc.status !== "checking") {
        throw new Error("Document is not in checking status");
      }

      // 確認者権限チェック
      if (!doc.approvalRequest) {
        throw new Error("No approval request found");
      }

      if (doc.approvalRequest.checker_id !== user.id) {
        throw new Error("You are not the checker for this document");
      }

      // ステータスを pending に更新
      await tx.document.update({
        where: { id: documentId },
        data: { status: "pending" },
      });

      // ApprovalRequest に checked_at を記録
      await tx.approvalRequest.update({
        where: { id: doc.approvalRequest.id },
        data: { checked_at: new Date() },
      });

      // ApprovalHistory に確認レコードを追加
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "confirmed",
          comment: comment || null,
        },
      });

      return { status: "pending" };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Confirm document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Document not found") {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (
      error.message === "Document is not in checking status" ||
      error.message === "No approval request found" ||
      error.message === "You are not the checker for this document"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to confirm document" },
      { status: 500 }
    );
  }
}
