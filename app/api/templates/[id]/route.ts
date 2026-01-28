import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// テンプレート更新
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { name, content } = await req.json();
    const templateId = parseInt(params.id);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    // テンプレートの存在確認
    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 作成者のみ更新可能（管理者は全て更新可能）
    if (existingTemplate.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only the creator or admin can update this template" },
        { status: 403 }
      );
    }

    const template = await prisma.template.update({
      where: { id: templateId },
      data: {
        name: name || existingTemplate.name,
        content: content ? JSON.stringify(content) : existingTemplate.content,
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
    console.error("Update template error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// テンプレート削除
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const templateId = parseInt(params.id);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
    }

    // テンプレートの存在確認
    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 作成者のみ削除可能（管理者は全て削除可能）
    if (existingTemplate.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only the creator or admin can delete this template" },
        { status: 403 }
      );
    }

    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete template error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
