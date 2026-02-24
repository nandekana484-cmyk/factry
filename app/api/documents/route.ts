await Promise.resolve();

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateManagementNumber } from "@/lib/documentNumber";

// 文書一覧取得
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // draft, pending, approved
    const creatorId = searchParams.get("creatorId");
    const folderId = searchParams.get("folderId");
    const typeId = searchParams.get("typeId");

    const where: any = {};

    // ステータス別の権限フィルタリング
    if (status === "checking") {
      // 確認待ち：確認者のみ表示
      where.status = "checking";
      where.approvalRequest = {
        checker_id: user.id,
      };
    } else if (status === "pending") {
      // 承認待ち：承認者のみ表示
      where.status = "pending";
      where.approvalRequest = {
        approver_id: user.id,
      };
    } else if (status === "draft") {
      // 下書き：作成者のみ表示
      where.status = "draft";
      where.creator_id = user.id;
    } else if (status === "approved") {
      // 承認済み：全員が見られる（フォルダ権限で制御）
      where.status = "approved";
    } else if (status) {
      where.status = status;
    }

    // adminは全て見られる（ただしステータスフィルタは適用）
    if (user.role !== "admin" && !status) {
      // ステータス指定なしの場合は、自分が関係する文書のみ
      where.OR = [
        { creator_id: user.id },
        { approvalRequest: { checker_id: user.id } },
        { approvalRequest: { approver_id: user.id } },
      ];
    }

    if (creatorId && user.role === "admin") {
      where.creator_id = parseInt(creatorId);
    }

    if (folderId) {
      where.folder_id = parseInt(folderId);
    }

    if (typeId) {
      where.document_type_id = parseInt(typeId);
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        folder: {
          select: { id: true, name: true, code: true },
        },
        documentType: {
          select: { id: true, code: true, name: true },
        },
        approvalRequest: {
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            checker: {
              select: { id: true, name: true, email: true },
            },
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
        } as any,
        revisionHistories: {
          where: { approved_at: { not: null } },
          orderBy: { approved_at: "desc" },
          take: 1,
          include: {
            approvedBy: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { blocks: true },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({
      ok: true,
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        status: doc.status,
        managementNumber: doc.folder
            ? (doc.sequence != null && doc.revision != null
              ? generateManagementNumber(doc.folder, doc.sequence, doc.revision)
              : null)
            : null,
        creator: doc.creator,
        folder: doc.folder,
        documentType: doc.documentType,
        approvalRequest: doc.approvalRequest,
        latestRevision: doc.revisionHistories[0]
          ? {
              id: doc.revisionHistories[0].id,
              // 履歴の管理番号も動的生成（必要なら）
              managementNumber: doc.folder
                ? (doc.sequence != null && doc.revision != null
                  ? generateManagementNumber(doc.folder, doc.sequence, doc.revision)
                  : null)
                : null,
              revisionSymbol: doc.revisionHistories[0].revision_symbol,
              approvedBy: doc.revisionHistories[0].approvedBy,
              approvedAt: doc.revisionHistories[0].approved_at,
            }
          : null,
        blockCount: doc._count.blocks,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      })),
    });
  } catch (error: any) {
    console.error("Get documents error:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: "Failed to get documents" },
      { status: 500 }
    );
  }
}

// 文書作成・保存（下書き保存または新規作成）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { title, blocks, status = "draft", documentId, folderId } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    // 新規作成時はフォルダIDが必須
    if (!documentId && !folderId) {
      return NextResponse.json(
        { error: "folderId is required for new documents" },
        { status: 400 }
      );
    }

    // 既存文書の更新（上書き保存）
    if (documentId) {
      const existingDoc = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!existingDoc) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      if (existingDoc.creator_id !== user.id) {
        return NextResponse.json(
          { error: "Only creator can update this document" },
          { status: 403 }
        );
      }

      // ブロックを削除して再作成
      await prisma.documentBlock.deleteMany({
        where: { document_id: documentId },
      });

      const document = await prisma.document.update({
        where: { id: documentId },
        data: {
          title,
          blocks: {
            create: (blocks || []).map((block: any, index: number) => ({
              type: block.type || "text",
              content: JSON.stringify(block),
              position_x: block.x || 0,
              position_y: block.y || 0,
              width: block.width || 100,
              height: block.height || 50,
              sort_order: index,
            })),
          },
        },
        include: {
          blocks: true,
        },
      });

      return NextResponse.json({ ok: true, document });
    }

    // 新規文書作成
    // フォルダ情報取得
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { parent: true },
    });
    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    // そのフォルダ内の最大sequenceを取得
    const lastDocument = await prisma.document.findFirst({
      where: { folder_id: folderId },
      orderBy: { sequence: "desc" },
    });
    const nextSequence = lastDocument ? (lastDocument.sequence ?? 0) + 1 : 1;
    const document = await prisma.document.create({
      data: {
        title,
        status,
        creator_id: user.id,
        folder_id: folderId,
        sequence: nextSequence,
        revision: 0,
        blocks: {
          create: (blocks || []).map((block: any, index: number) => ({
            type: block.type || "text",
            content: JSON.stringify(block),
            position_x: block.x || 0,
            position_y: block.y || 0,
            width: block.width || 100,
            height: block.height || 50,
            sort_order: index,
          })),
        },
      },
      include: {
        blocks: true,
        folder: { select: { id: true, code: true, parent: { select: { code: true } } } },
      },
    });
    return NextResponse.json({
      ok: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        managementNumber:
          document.folder && document.sequence != null && document.revision != null
            ? generateManagementNumber(document.folder, document.sequence, document.revision)
            : null,
        creator_id: document.creator_id,
        folder_id: document.folder_id,
        sequence: document.sequence,
        revision: document.revision,
        blocks: document.blocks,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Create/Update document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create/update document" },
      { status: 500 }
    );
  }
}
