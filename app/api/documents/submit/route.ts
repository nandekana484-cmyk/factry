import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canAssignWorkflowRole } from "@/lib/role";
import { UserRole } from "@/types/document";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    console.log("submit body:", body);

    const { documentId, checkerId, approverId, comment } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    if (!checkerId || !approverId) {
      return NextResponse.json(
        { error: "checkerId and approverId are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      // ★★★ 作成者チェック（role チェックは不要）★★★
      if (document.creator_id !== user.id) {
        return NextResponse.json(
          { error: "Only creator can submit this document" },
          { status: 403 }
        );
      }

      // ★★★ checker role チェック ★★★
      const checkerUser = await tx.user.findUnique({
        where: { id: checkerId },
      });

      if (!checkerUser) {
        return NextResponse.json(
          { error: "Checker user not found" },
          { status: 404 }
        );
      }

      if (!canAssignWorkflowRole(checkerUser.role as UserRole, "checker")) {
        return NextResponse.json(
          { error: "Invalid checker role" },
          { status: 400 }
        );
      }

      // ★★★ approver role チェック ★★★
      const approverUser = await tx.user.findUnique({
        where: { id: approverId },
      });

      if (!approverUser) {
        return NextResponse.json(
          { error: "Approver user not found" },
          { status: 404 }
        );
      }

      if (!canAssignWorkflowRole(approverUser.role as UserRole, "approver")) {
        return NextResponse.json(
          { error: "Invalid approver role" },
          { status: 400 }
        );
      }

      if (document.status !== "draft") {
        return NextResponse.json(
          { error: "Only draft documents can be submitted" },
          { status: 403 }
        );
      }

      // ★★★ 文書ステータス更新 ★★★
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "checking",
        },
      });

      // ★★★ 承認リクエスト作成 ★★★
      await tx.approvalRequest.create({
        data: {
          document_id: documentId,
          requester_id: user.id,
          checker_id: checkerId,
          approver_id: approverId,
          comment: comment || null,
        },
      });

      // ★★★ 履歴作成 ★★★
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "submitted",
          comment: comment || null,
        },
      });

      return { status: "checking" };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Submit for approval error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to submit for approval" },
      { status: 500 }
    );
  }
}