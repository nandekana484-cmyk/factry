import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 文書種別一覧取得
export async function GET() {
  try {
    const documentTypes = await prisma.documentType.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      ok: true,
      documentTypes: documentTypes.map((dt) => ({
        id: dt.id,
        code: dt.code,
        name: dt.name,
        description: dt.description,
        order: dt.order,
        createdAt: dt.created_at,
        updatedAt: dt.updated_at,
      })),
    });
  } catch (error) {
    console.error("Get document types error:", error);
    return NextResponse.json(
      { error: "Failed to get document types" },
      { status: 500 }
    );
  }
}

// 文書種別作成
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    
    // 管理者のみ実行可能
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can create document types" },
        { status: 403 }
      );
    }

    const { code, name, description, order } = await req.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "code and name are required" },
        { status: 400 }
      );
    }

    // コードの重複チェック
    const existing = await prisma.documentType.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Document type code already exists" },
        { status: 400 }
      );
    }

    const documentType = await prisma.documentType.create({
      data: {
        code,
        name,
        description: description || null,
        order: order || 0,
      },
    });

    return NextResponse.json({
      ok: true,
      documentType: {
        id: documentType.id,
        code: documentType.code,
        name: documentType.name,
        description: documentType.description,
        order: documentType.order,
      },
    });
  } catch (error: any) {
    console.error("Create document type error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create document type" },
      { status: 500 }
    );
  }
}
