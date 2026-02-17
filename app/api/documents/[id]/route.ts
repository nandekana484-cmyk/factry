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

    // ★★★ admin は全件読める、それ以外は creator のみ ★★★
    const where =
      user.role === "admin"
        ? { id: documentId }
        : { id: documentId, creator_id: user.id };

    const document = await prisma.document.findFirst({
      where,
      include: { blocks: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
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
        source: "user",
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
      document: {
        id: document.id,
        title: document.title,
        pages,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      },
    });
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json({ error: "Failed to get document" }, { status: 500 });
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