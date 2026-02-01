import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sections = await prisma.section.findMany();
  return NextResponse.json({ sections });
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data.department_id) {
    return NextResponse.json({ error: "department_id is required" }, { status: 400 });
  }
  const section = await prisma.section.create({
    data: {
      name: data.name,
      department_id: data.department_id,
      order: data.order ?? 0,
      enabled: data.enabled ?? true,
    },
  });
  return NextResponse.json({ section });
}

export async function PATCH(req: Request) {
  const data = await req.json();
  const section = await prisma.section.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json({ section });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.section.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
