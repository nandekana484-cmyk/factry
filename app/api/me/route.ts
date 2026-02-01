import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      department: true,
      section: true,
      position: true,
    },
  });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dbUser);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updateData: any = {
    name: body.name,
    email: body.email,
    department_id: body.department_id ?? null,
    section_id: body.section_id ?? null,
    position_id: body.position_id ?? null,
  };
  if (body.password && body.password.length > 0) {
    updateData.password = await bcrypt.hash(body.password, 10);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });
  return NextResponse.json({ ok: true });
}
