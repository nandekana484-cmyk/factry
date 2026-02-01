import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const body = await req.json();
  const { name, email, role, disabled, department_id, section_id, position_id } = body;
  const validRoles = ["user", "creator", "checker", "approver", "admin"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const { id } = await context.params;
  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(disabled !== undefined && { disabled }),
      ...(department_id !== undefined && { department_id }),
      ...(section_id !== undefined && { section_id }),
      ...(position_id !== undefined && { position_id }),
    },
    include: {
      department: true,
      section: true,
      position: true,
    },
  });
  return NextResponse.json(updated);
}
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
