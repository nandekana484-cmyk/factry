await Promise.resolve();

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await Promise.resolve();

  const { id } = await context.params;
  const documentId = parseInt(id, 10);

  if (isNaN(documentId)) {
    return NextResponse.json({ error: "Invalid document id" }, { status: 400 });
  }

  try {
    const user = await requireAuth();

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { 
        blocks: true,
        approvalRequest: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 権限チェック：以下のいずれかの場合は閲覧可能
    // 1. adminユーザー
    // 2. 文書の作成者
    // 3. 確認者（checker）
    // 4. 承認者（approver）
    const isCreator = document.creator_id === user.id;
    const isChecker = document.approvalRequest?.checker_id === user.id;
    const isApprover = document.approvalRequest?.approver_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isAdmin && !isCreator && !isChecker && !isApprover) {
      return NextResponse.json({ 
        error: "You do not have permission to view this document" 
      }, { status: 403 });
    }

    const restoredBlocks = document.blocks.map((block: any) => {
      const parsed = JSON.parse(block.content);
      return {
        ...parsed,
        id: block.id,
        x: parsed.x ?? block.position_x,
        y: parsed.y ?? block.position_y,
        width: parsed.width ?? block.width,
        height: parsed.height ?? block.height,
        locked: false,
        editable: true,
        source: parsed.source || "user",
      };
    });

    const pages = [
      {
        id: "page-1",
        number: 1,
        blocks: restoredBlocks,
      },
    ];

    return NextResponse.json({
      ok: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        managementNumber: document.management_number,
        creator: {
          id: document.creator_id,
        },
        pages,
        blocks: restoredBlocks,
        approvalRequest: document.approvalRequest,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Get document error:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json({ ok: false, error: "Failed to get document" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await Promise.resolve();

  const { id } = await context.params;
  const documentId = parseInt(id, 10);

  if (isNaN(documentId)) {
    return NextResponse.json({ error: "Invalid document id" }, { status: 400 });
  }

  try {
    const user = await requireAuth();

    // admin は全削除可能、それ以外は自分の文書のみ
    const where =
      user.role === "admin"
        ? { id: documentId }
        : { id: documentId, creator_id: user.id };

    const existing = await prisma.document.findFirst({ where });

    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // ブロック削除
    await prisma.documentBlock.deleteMany({
      where: { document_id: documentId },
    });

    // 文書削除
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}