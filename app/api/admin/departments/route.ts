import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const departments = await prisma.department.findMany();
  return NextResponse.json({ departments });
}

export async function POST(req: Request) {
  const data = await req.json();
  const department = await prisma.department.create({ data });
  return NextResponse.json({ department });
}

export async function PATCH(req: Request) {
  const data = await req.json();
  const department = await prisma.department.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json({ department });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.department.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
