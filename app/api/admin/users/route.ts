import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      lastLogin: true,
      // folderId: true, // Prisma Userモデルに存在しないため削除
      department_id: true,
      section_id: true,
      position_id: true,
      last_name: true,
      first_name: true,
      middle_name: true,
      department: { select: { name: true } },
      section: { select: { name: true } },
      position: { select: { name: true } },
    },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(users);
}
