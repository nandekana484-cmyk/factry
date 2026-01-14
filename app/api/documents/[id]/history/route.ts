import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 承認履歴取得
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);

    const history = await prisma.approvalHistory.findMany({
      where: { document_id: documentId },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      ok: true,
      history: history.map((h) => ({
        id: h.id,
        action: h.action,
        comment: h.comment,
        createdAt: h.created_at,
        user: h.user,
      })),
    });
  } catch (error) {
    console.error("Get approval history error:", error);
    return NextResponse.json(
      { error: "Failed to get approval history" },
      { status: 500 }
    );
  }
}
