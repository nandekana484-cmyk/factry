import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 承認（pending → approved、承認者が実行）
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
        include: {
          approvalRequest: true,
          revisionHistories: {
            where: { approved_at: { not: null } },
            orderBy: { approved_at: "desc" },
          },
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      if (!document.approvalRequest) {
        throw new Error("Approval request not found");
      }

      // 承認者のみ実行可能
      if (document.approvalRequest.approver_id !== user.id) {
        throw new Error("Only the assigned approver can approve this document");
      }

      // 作成者は承認できない
      if (document.creator_id === user.id) {
        throw new Error("Creator cannot approve their own document");
      }

      // 確認者は承認できない
      if (document.approvalRequest.checker_id === user.id) {
        throw new Error("Checker cannot approve the document");
      }

      if (document.status !== "pending" && document.status !== "checking") {
        throw new Error("Only pending or checking documents can be approved");
      }

      // 改定記号を計算（承認済みの改訂履歴から最新を取得）
      const latestRevision = (document as any).revisionHistories[0];
      let revisionSymbol = "R0"; // デフォルトは初版
      let isRevision = false;
      
      if (latestRevision) {
        // 既に承認済みの場合は改定
        isRevision = true;
        const match = latestRevision.revision_symbol.match(/R(\d+)/);
        if (match) {
          const nextRevisionNumber = parseInt(match[1]) + 1;
          revisionSymbol = `R${nextRevisionNumber}`;
        } else {
          revisionSymbol = "R1";
        }
      }

      // 改定の場合、新しい管理番号を生成
      let newManagementNumber = document.management_number;
      if (isRevision && document.folder_id) {
        const folder = await (tx as any).folder.findUnique({
          where: { id: document.folder_id },
        });

        if (folder) {
          // フォルダ内の文書数をカウント
          const folderDocCount = await tx.document.count({
            where: {
              folder_id: document.folder_id,
              management_number: { startsWith: folder.code },
            },
          });

          // 新しい管理番号を生成
          const seq = (folderDocCount + 1).toString().padStart(3, "0");
          newManagementNumber = `${folder.code}-${seq}`;
        }
      }

      // 文書の状態を approved に更新し、改定の場合は管理番号も更新
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "approved",
          management_number: newManagementNumber,
        },
      });

      // 承認リクエストを削除
      if (document.approvalRequest) {
        await tx.approvalRequest.delete({
          where: { document_id: documentId },
        });
      }

      // RevisionHistoryを作成（常に新規作成）
      await tx.revisionHistory.create({
        data: {
          document_id: documentId,
          management_number: newManagementNumber || "",
          revision_symbol: revisionSymbol,
          title: document.title,
          approved_by_id: user.id,
          checked_by_id: (document.approvalRequest as any)!.checker_id,
          created_by_id: document.creator_id,
          approved_at: new Date(),
        },
      });

      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "approved",
          comment: comment || null,
        },
      });

      return { status: "approved", managementNumber: newManagementNumber };
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      managementNumber: result.managementNumber,
    });
  } catch (error: any) {
    console.error("Approve document error:", error);

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
      error.message === "Only the assigned approver can approve this document" ||
      error.message === "Creator cannot approve their own document" ||
      error.message === "Checker cannot approve the document" ||
      error.message === "Only pending or checking documents can be approved"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to approve document" },
      { status: 500 }
    );
  }
}
