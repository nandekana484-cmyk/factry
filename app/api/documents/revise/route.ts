import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 改定開始（approved → draftまたは軽微修正、作成者が実行）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { documentId, comment, reviseType = "major" } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    if (reviseType !== "major" && reviseType !== "minor") {
      return NextResponse.json(
        { error: "reviseType must be 'major' or 'minor'" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 文書の状態を確認
      const document = await tx.document.findUnique({
        where: { id: documentId },
        include: {
          revisionHistories: {
            orderBy: { created_at: "desc" },
          },
        },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      // 作成者のみ実行可能
      if (document.creator_id !== user.id) {
        throw new Error("Only the creator can revise the document");
      }

      if (document.status !== "approved") {
        throw new Error("Only approved documents can be revised");
      }

      // 承認済みの改定をカウント
      const approvedRevisions = (document as any).revisionHistories.filter(
        (r: any) => r.approved_at !== null
      );

      if (reviseType === "minor") {
        // 軽微修正（承認不要）
        // minorのカウント（M1, M2...）
        const minorRevisions = (document as any).revisionHistories.filter(
          (r: any) => r.revision_symbol && r.revision_symbol.startsWith("M")
        );
        const minorCount = minorRevisions.length + 1;
        const minorSymbol = `M${minorCount}`;

        // statusはapprovedのまま
        // 管理番号も変更なし
        
        // RevisionHistoryに軽微修正として記録
        await tx.revisionHistory.create({
          data: {
            document_id: documentId,
            management_number: (document as any).management_number || "",
            revision_symbol: minorSymbol,
            title: document.title,
            created_by_id: document.creator_id,
            approved_by_id: null, // 承認不要
            checked_by_id: null,  // 確認不要
            approved_at: new Date(), // 軽微修正は即座に「承認」扱い
          },
        });

        // 履歴を記録
        await tx.approvalHistory.create({
          data: {
            document_id: documentId,
            user_id: user.id,
            action: "revised",
            comment: comment ? `${comment} (${minorSymbol} - 軽微修正)` : `軽微修正 (${minorSymbol})`,
          },
        });

        return { 
          status: "approved", 
          revisionSymbol: minorSymbol,
          reviseType: "minor"
        };
      } else {
        // major: 正式改定（承認が必要）
        const newRevisionSymbol = `R${approvedRevisions.length + 1}`;

        // 文書の状態を draft に戻す
        await tx.document.update({
          where: { id: documentId },
          data: { status: "draft" },
        });

        // 履歴を記録（改定記号を記録）
        await tx.approvalHistory.create({
          data: {
            document_id: documentId,
            user_id: user.id,
            action: "revised",
            comment: comment ? `${comment} (${newRevisionSymbol})` : `改定開始 (${newRevisionSymbol})`,
          },
        });

        // Note: RevisionHistory は承認時にのみ作成される

        return { 
          status: "draft", 
          revisionSymbol: newRevisionSymbol,
          reviseType: "major"
        };
      }
    });

    return NextResponse.json({ 
      ok: true, 
      status: result.status, 
      revisionSymbol: result.revisionSymbol,
      reviseType: result.reviseType
    });
  } catch (error: any) {
    console.error("Revise document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Document not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === "Only the creator can revise the document" ||
      error.message === "Only approved documents can be revised"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to revise document" },
      { status: 500 }
    );
  }
}
