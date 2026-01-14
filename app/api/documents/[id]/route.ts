import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 文書取得
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        creator: {
          select: { id: true, email: true, role: true },
        },
        blocks: {
          orderBy: { sort_order: "asc" },
        },
        approvalRequest: {
          include: {
            requester: {
              select: { id: true, email: true },
            },
          },
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
    const blocks = document.blocks.map((block) => ({
      ...JSON.parse(block.content),
      id: block.id,
    }));

    return NextResponse.json({
      ok: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        creator: document.creator,
        blocks,
        approvalRequest: document.approvalRequest,
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
