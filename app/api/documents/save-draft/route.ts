import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 下書き保存（draft のまま保存）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { documentId, title, blocks, folderId, documentTypeId } = body;

    console.log("[save-draft] body:", body);

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: "Blocks is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // ★★★ テンプレートブロックは保存しない ★★★
    const userBlocks = blocks.filter((b: any) => b.source === "user");

    const result = await prisma.$transaction(async (tx) => {
      let document;

      if (documentId) {
        const existing = await tx.document.findUnique({
          where: { id: documentId },
        });

        if (!existing) throw new Error("Document not found");
        if (existing.creator_id !== user.id)
          throw new Error("Only creator can edit this document");
        if (existing.status !== "draft")
          throw new Error("Only draft documents can be edited");

        document = await tx.document.update({
          where: { id: documentId },
          data: {
            title,
            folder_id: folderId ?? existing.folder_id,
            document_type_id:
              documentTypeId ?? existing.document_type_id,
            updated_at: new Date(),
          },
        });

        await tx.documentBlock.deleteMany({
          where: { document_id: documentId },
        });
      } else {
        document = await tx.document.create({
          data: {
            title,
            status: "draft",
            creator_id: user.id,
            folder_id: folderId || null,
            document_type_id: documentTypeId || null,
            sequence: 1,
          },
        });
      }

      // ★★★ 保存するのは userBlocks のみ ★★★
      await tx.documentBlock.createMany({
        data: userBlocks.map((block: any, index: number) => ({
          document_id: document.id,
          type: block.type || "text",
          content: JSON.stringify(block),
          position_x: block.x || 0,
          position_y: block.y || 0,
          width: block.width || 100,
          height: block.height || 100,
          sort_order: index,
        })),
      });

      return document;
    });

    return NextResponse.json({
      documentId: result.id,
      status: result.status,
    });
  } catch (error: any) {
    console.error("Save draft error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Document not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === "Only creator can edit this document" ||
      error.message === "Only draft documents can be edited"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}