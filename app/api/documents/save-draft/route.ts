import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 下書き保存（draft のまま保存）
export async function POST(req: Request) {
  try {
    const { documentId, title, blocks, creatorId } = await req.json();

    // 既存文書の更新または新規作成
    const document = documentId
      ? await prisma.document.update({
          where: { id: documentId },
          data: {
            title,
            updated_at: new Date(),
          },
        })
      : await prisma.document.create({
          data: {
            title,
            status: "draft",
            creator_id: creatorId,
          },
        });

    // ブロックを削除して再作成
    await prisma.documentBlock.deleteMany({
      where: { document_id: document.id },
    });

    if (blocks && blocks.length > 0) {
      await prisma.documentBlock.createMany({
        data: blocks.map((block: any, index: number) => ({
          document_id: document.id,
          type: block.type,
          content: JSON.stringify(block),
          position_x: block.x,
          position_y: block.y,
          width: block.width,
          height: block.height,
          sort_order: index,
        })),
      });
    }

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      status: document.status,
    });
  } catch (error) {
    console.error("Save draft error:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
