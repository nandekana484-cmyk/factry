// ...既存の下側のimportと関数のみ残す...
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// フォルダ一覧取得
export async function GET() {
  try {
    await requireAuth();

    const folders = await prisma.folder.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return NextResponse.json({ folders });
  } catch (error: any) {
    console.error("Get folders error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// フォルダ作成
export async function POST(req: Request) {
  try {
    await requireAuth();
    const { name, code, parentId } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "name and code are required" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        code: code.toUpperCase(),
        parent_id: parentId || null,
      },
    });

    return NextResponse.json({ ok: true, folder });
  } catch (error: any) {
    console.error("Create folder error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Admin role required") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
