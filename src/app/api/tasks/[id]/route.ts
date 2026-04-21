import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { TASK_STATUS } from "@/types";
import type { ApiResponse, TaskDTO, TaskStatus } from "@/types";

const VALID_STATUSES = Object.values(TASK_STATUS);

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<TaskDTO | null>>> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        messages: true,
        decisions: true,
        approvals: true,
        memorySnapshots: true,
        githubLinks: true,
      },
    });
    return NextResponse.json({ success: true, data: task as TaskDTO | null });
  } catch (error) {
    console.error(`GET /api/tasks/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<TaskDTO>>> {
  try {
    const body = await request.json();
    const { title, description, acceptanceCriteria, status } = body;

    if (status && !VALID_STATUSES.includes(status as TaskStatus)) {
      return NextResponse.json(
        { success: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const before = await prisma.task.findUnique({
      where: { id: params.id },
    });

    const task = await prisma.task.update({
      where: { id: params.id },
      data: { title, description, acceptanceCriteria, status },
    });

    let action = "UPDATE";
    if (before?.status !== status) {
      action = "STATUS_CHANGE";
    }

    await createAuditLog({
      taskId: task.id,
      entity: "Task",
      entityId: task.id,
      action,
      before,
      after: task,
    });

    return NextResponse.json({ success: true, data: task as TaskDTO });
  } catch (error) {
    console.error(`PUT /api/tasks/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const before = await prisma.task.findUnique({
      where: { id: params.id },
    });

    await prisma.task.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      taskId: params.id,
      entity: "Task",
      entityId: params.id,
      action: "DELETE",
      before,
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error(`DELETE /api/tasks/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
