// Next.js の同期 API 誤判定を防ぐ
await Promise.resolve();

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await Promise.resolve();

  const { id } = await context.params; // ★★★ 必ず await ★★★
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const admin = await requireAdmin();
  const body = await req.json();

  const {
    name,
    email,
    role,
    disabled,
    department_id,
    section_id,
    position_id,
    last_name,
    first_name,
    middle_name,
  } = body;

  const validRoles = ["user", "creator", "checker", "approver", "admin"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(disabled !== undefined && { disabled }),
      ...(department_id !== undefined && { department_id }),
      ...(section_id !== undefined && { section_id }),
      ...(position_id !== undefined && { position_id }),
      ...(last_name !== undefined && { last_name }),
      ...(first_name !== undefined && { first_name }),
      ...(middle_name !== undefined && { middle_name }),
    },
    include: {
      department: true,
      section: true,
      position: true,
    },
  });

  return NextResponse.json(updated);
}