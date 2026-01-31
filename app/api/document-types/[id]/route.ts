import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canAssignWorkflowRole } from "@/lib/role";
import { UserRole } from "@/types/document";

// 文書種別取得
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentType = await prisma.documentType.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      documentType: {
        id: documentType.id,
        code: documentType.code,
        name: documentType.name,
        description: documentType.description,
        order: documentType.order,
      },
    });
  } catch (error) {
    console.error("Get document type error:", error);
    return NextResponse.json(
      { error: "Failed to get document type" },
      { status: 500 }
    );
  }
}

// 文書種別更新
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    // 管理者のみ実行可能
    if (!canAssignWorkflowRole(user.role, "admin")) {
      return NextResponse.json(
        { error: "Only admin can update document types" },
        { status: 403 }
      );
    }

    const { code, name, description, order } = await req.json();

    const documentType = await prisma.documentType.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({
      ok: true,
      documentType: {
        id: documentType.id,
        code: documentType.code,
        name: documentType.name,
        description: documentType.description,
        order: documentType.order,
      },
    });
  } catch (error: any) {
    console.error("Update document type error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update document type" },
      { status: 500 }
    );
  }
}

// 文書種別削除
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    // 管理者のみ実行可能
    if (!canAssignWorkflowRole(user.role, "admin")) {
      return NextResponse.json(
        { error: "Only admin can delete document types" },
        { status: 403 }
      );
    }

    // この文書種別を使用している文書があるかチェック
    const documentCount = await prisma.document.count({
      where: { document_type_id: parseInt(params.id) },
    });

    if (documentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete document type: ${documentCount} documents are using it` },
        { status: 400 }
      );
    }

    await prisma.documentType.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete document type error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete document type" },
      { status: 500 }
    );
  }
}
