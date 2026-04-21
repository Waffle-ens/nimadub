import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { APPROVAL_STATUS } from "@/types";
import type { ApiResponse, ApprovalDTO, ApprovalStatus } from "@/types";

const VALID_STATUSES = Object.values(APPROVAL_STATUS);

interface RouteParams {
  params: { id: string };
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ApprovalDTO>>> {
  try {
    const body = await request.json();
    const { status, reviewedBy } = body;

    if (!status || !VALID_STATUSES.includes(status as ApprovalStatus)) {
      return NextResponse.json(
        { success: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const before = await prisma.approval.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json(
        { success: false, error: "Approval not found" },
        { status: 404 }
      );
    }

    const approval = await prisma.approval.update({
      where: { id: params.id },
      data: {
        status,
        reviewedBy: reviewedBy ?? null,
        reviewedAt: [APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED].includes(status)
          ? new Date()
          : null,
      },
    });

    await createAuditLog({
      taskId: before.taskId,
      entity: "Approval",
      entityId: approval.id,
      action: "STATUS_CHANGE",
      before,
      after: approval,
      actor: reviewedBy,
    });

    return NextResponse.json({ success: true, data: approval as ApprovalDTO });
  } catch (error) {
    console.error(`PUT /api/approvals/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update approval" },
      { status: 500 }
    );
  }
}
