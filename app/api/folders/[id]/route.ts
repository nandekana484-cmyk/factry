import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// フォルダ詳細取得
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, folder });
  } catch (error: any) {
    console.error("Get folder error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to get folder" },
      { status: 500 }
    );
  }
}

// フォルダ更新
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const body = await req.json();
    console.log('[API][PUT] req.json:', body);
    const { name, code, parentId } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "name and code are required" },
        { status: 400 }
      );
    }

    // paramsがPromiseの場合にawaitでアンラップ
    const { id } = await ctx.params;

    const updateData = {
      name,
      code: code.toUpperCase(),
      parent_id: parentId,
    };
    console.log('[API][PUT] prisma.folder.update data:', updateData);
    const folder = await prisma.folder.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ ok: true, folder });
  } catch (error: any) {
    console.error("Update folder error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// フォルダ削除
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    // フォルダ配下のドキュメント数をチェック
    const documentsCount = await prisma.document.count({
      where: { folder_id: parseInt(params.id) },
    });

    if (documentsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete folder with documents" },
        { status: 400 }
      );
    }

    // 子フォルダの存在チェック
    const childrenCount = await prisma.folder.count({
      where: { parent_id: parseInt(params.id) },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete folder with subfolders" },
        { status: 400 }
      );
    }

    await prisma.folder.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete folder error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
