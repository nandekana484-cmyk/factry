import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 改訂履歴取得
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const documentId = parseInt(id);

    // 文書の存在確認
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // 改訂履歴を取得（承認済みのもののみ、新しい順）
    const revisions = await prisma.revisionHistory.findMany({
      where: {
        document_id: documentId,
        approved_at: { not: null },
      },
      include: {
        approvedBy: {
          select: { id: true, name: true },
        },
        checkedBy: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { approved_at: "desc" },
    });

    // レスポンス形式を整形
    const revisionsWithUsers = (revisions as any[]).map((rev: any) => ({
      id: rev.id,
      managementNumber: rev.management_number,
      revisionSymbol: rev.revision_symbol,
      title: rev.title,
      approvedBy: rev.approvedBy
        ? { id: rev.approvedBy.id, name: rev.approvedBy.name }
        : null,
      checkedBy: rev.checkedBy
        ? { id: rev.checkedBy.id, name: rev.checkedBy.name }
        : null,
      createdBy: { id: rev.createdBy.id, name: rev.createdBy.name },
      approvedAt: rev.approved_at,
      createdAt: rev.created_at,
    }));

    return NextResponse.json({
      ok: true,
      revisions: revisionsWithUsers,
    });
  } catch (error: any) {
    console.error("Get revisions error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to get revisions" },
      { status: 500 }
    );
  }
}
