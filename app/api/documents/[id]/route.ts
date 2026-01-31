import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateManagementNumber } from "@/lib/documentNumber";

// 文書取得
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        folder: true,
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        blocks: {
          orderBy: { sort_order: "asc" },
        },
        approvalRequest: {
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            checker: {
              select: { id: true, name: true, email: true },
            },
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
        } as any,
        revisionHistories: {
          where: { approved_at: { not: null } },
          orderBy: { approved_at: "desc" },
          take: 1,
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
        },
        _count: {
          select: {
            revisionHistories: {
              where: { approved_at: { not: null } },
            },
          } as any,
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // ブロックのcontentをパース
    const blocks = (document as any).blocks.map((block: any) => ({
      ...JSON.parse(block.content),
      id: block.id,
    }));

    return NextResponse.json({
      ok: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        managementNumber: generateManagementNumber(
          document.folder,
          document.sequence,
          document.revision
        ),
        creator: document.creator,
        blocks,
        approvalRequest: document.approvalRequest,
        latestRevision: document.revisionHistories[0]
          ? {
              id: document.revisionHistories[0].id,
              managementNumber: generateManagementNumber(
                document.folder,
                document.sequence,
                document.revision
              ),
              revisionSymbol: document.revisionHistories[0].revision_symbol,
              title: document.revisionHistories[0].title,
              approvedBy: document.revisionHistories[0].approvedBy,
              checkedBy: document.revisionHistories[0].checkedBy,
              createdBy: document.revisionHistories[0].createdBy,
              approvedAt: document.revisionHistories[0].approved_at,
            }
          : null,
        revisionCount: document._count.revisionHistories,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      },
    });
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}

// 文書削除
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const documentId = parseInt(id);

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // 作成者のみ削除可能
    if ((document as any).creator_id !== user.id) {
      return NextResponse.json(
        { error: "Only creator can delete this document" },
        { status: 403 }
      );
    }

    // 下書きのみ削除可能
    if (document.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft documents can be deleted" },
        { status: 403 }
      );
    }

    // 文書とそれに紐づくブロックを削除（カスケード削除）
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
