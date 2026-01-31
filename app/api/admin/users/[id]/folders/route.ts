import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ユーザーのアクセス可能なフォルダID一覧
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const userId = parseInt(id);
  const access = await prisma.user_folder_access.findMany({
    where: { userId },
    select: { folderId: true, canRead: true, canWrite: true },
  });
  return NextResponse.json({
    folderAccess: access.map((a) => ({
      folderId: a.folderId,
      canRead: a.canRead,
      canWrite: a.canWrite,
    })),
  });
}

// PUT: アクセス権を保存
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const userId = parseInt(id);
  const { folderAccess } = await req.json();
  // 既存削除
  await prisma.user_folder_access.deleteMany({ where: { userId } });
  // 新規登録
  if (Array.isArray(folderAccess) && folderAccess.length > 0) {
    await prisma.user_folder_access.createMany({
      data: folderAccess.map((a: { folderId: number; canRead?: boolean; canWrite?: boolean }) => ({
        userId,
        folderId: a.folderId,
        canRead: a.canRead ?? true,
        canWrite: a.canWrite ?? false,
      })),
    });
  }
  return NextResponse.json({ success: true });
}
