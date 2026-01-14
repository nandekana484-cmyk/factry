import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 文書一覧取得
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // draft, pending, approved
    const creatorId = searchParams.get("creatorId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (creatorId) {
      where.creator_id = parseInt(creatorId);
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        creator: {
          select: { id: true, email: true, role: true },
        },
        approvalRequest: {
          include: {
            requester: {
              select: { id: true, email: true },
            },
          },
        },
        _count: {
          select: { blocks: true },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({
      ok: true,
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        status: doc.status,
        creator: doc.creator,
        approvalRequest: doc.approvalRequest,
        blockCount: doc._count.blocks,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      })),
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}
