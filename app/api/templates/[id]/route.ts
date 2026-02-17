import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const templateId = Number(id);
  if (isNaN(templateId)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
  }
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      creator: { select: { id: true, name: true, email: true } },
    },
  });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
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
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const user = await requireAuth();
  const { name, content } = await req.json();
  const { id } = await context.params;
  const templateId = Number(id);
  if (isNaN(templateId)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
  }
  const existingTemplate = await prisma.template.findUnique({
    where: { id: templateId },
  });
  if (!existingTemplate) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
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
      creator: { select: { id: true, name: true, email: true } },
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
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const user = await requireAuth();
  const { id } = await context.params;
  const templateId = Number(id);
  if (isNaN(templateId)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
  }
  const existingTemplate = await prisma.template.findUnique({
    where: { id: templateId },
  });
  if (!existingTemplate) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  if (existingTemplate.created_by !== user.id && user.role !== "admin") {
    return NextResponse.json(
      { error: "Only the creator or admin can delete this template" },
      { status: 403 }
    );
  }
  await prisma.template.delete({ where: { id: templateId } });
  return NextResponse.json({ ok: true });
}