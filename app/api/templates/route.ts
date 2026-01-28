import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// テンプレート一覧取得
export async function GET() {
  try {
    const user = await requireAuth();

    const templates = await prisma.template.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({
      ok: true,
      templates: templates.map((t) => ({
        id: t.id.toString(),
        name: t.name,
        content: JSON.parse(t.content),
        createdBy: t.creator.name,
        createdAt: t.created_at.getTime(),
        updatedAt: t.updated_at.getTime(),
      })),
    });
  } catch (error: any) {
    console.error("Get templates error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// テンプレート作成
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { name, content } = await req.json();

    if (!name || !content) {
      return NextResponse.json(
        { error: "name and content are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        content: JSON.stringify(content),
        created_by: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      template: {
        id: template.id.toString(),
        name: template.name,
        content: JSON.parse(template.content),
        createdBy: template.creator.name,
        createdAt: template.created_at.getTime(),
        updatedAt: template.updated_at.getTime(),
      },
    });
  } catch (error: any) {
    console.error("Create template error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
