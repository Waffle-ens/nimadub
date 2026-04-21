import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, ApprovalDTO } from "@/types";
// SQLite does not support enums; Prisma returns plain strings, so we cast to DTO

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ApprovalDTO[]>>> {
  try {
    const approvals = await prisma.approval.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: approvals as ApprovalDTO[] });
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/approvals error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ApprovalDTO>>> {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "title is required" },
        { status: 400 }
      );
    }

    const approval = await prisma.approval.create({
      data: {
        taskId: params.id,
        title,
        description,
      },
    });

    await createAuditLog({
      taskId: params.id,
      entity: "Approval",
      entityId: approval.id,
      action: "CREATE",
      after: approval,
    });

    return NextResponse.json({ success: true, data: approval as ApprovalDTO }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/approvals error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to create approval" },
      { status: 500 }
    );
  }
}
