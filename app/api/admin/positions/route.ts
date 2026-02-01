import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const positions = await prisma.position.findMany();
  return NextResponse.json({ positions });
}

export async function POST(req: Request) {
  const data = await req.json();
  const position = await prisma.position.create({ data });
  return NextResponse.json({ position });
}

export async function PATCH(req: Request) {
  const data = await req.json();
  const position = await prisma.position.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json({ position });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.position.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
