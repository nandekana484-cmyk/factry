import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ユーザーのアクセス可能なフォルダID一覧
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = parseInt(params.id);
  const access = await prisma.user_folder_access.findMany({
    where: { user_id: userId },
    select: { folder_id: true },
  });
  return NextResponse.json({ folderIds: access.map((a) => a.folder_id) });
}

// PUT: アクセス権を保存
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const userId = parseInt(params.id);
  const { folderIds } = await req.json();
  // 既存削除
  await prisma.user_folder_access.deleteMany({ where: { user_id: userId } });
  // 新規登録
  if (Array.isArray(folderIds) && folderIds.length > 0) {
    await prisma.user_folder_access.createMany({
      data: folderIds.map((folder_id: number) => ({ user_id: userId, folder_id })),
    });
  }
  return NextResponse.json({ success: true });
}
