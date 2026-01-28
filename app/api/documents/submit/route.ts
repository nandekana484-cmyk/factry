import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 承認申請（draft → pending）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { documentId, folderId, checkerId, approverId, comment } = await req.json();

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
      if (document.creator_id !== user.id) {
        throw new Error("Only creator can submit this document");
      }

      if (document.status !== "draft") {
        throw new Error("Only draft documents can be submitted");
      }

      // フォルダ情報を取得して管理番号を生成
      let managementNumber: string | null = null;
      if (folderId) {
        const folder = await tx.folder.findUnique({
          where: { id: folderId },
        });

        if (!folder) {
          throw new Error("Folder not found");
        }

        // フォルダ内の文書数をカウント（フォルダコードで始まる管理番号を持つ文書）
        const folderDocCount = await tx.document.count({
          where: {
            folder_id: folderId,
            management_number: { startsWith: folder.code },
          },
        });

        // 管理番号を生成（例: WI-001, MANUAL-015）
        const seq = (folderDocCount + 1).toString().padStart(3, "0");
        managementNumber = `${folder.code}-${seq}`;
      }

      // 文書の状態を checking に更新（確認待ち）
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "checking",
          folder_id: folderId || null,
          management_number: managementNumber,
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

      return { status: "checking", managementNumber };
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
