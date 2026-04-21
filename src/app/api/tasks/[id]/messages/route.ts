import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, TaskMessageDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<TaskMessageDTO[]>>> {
  try {
    const messages = await prisma.taskMessage.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: messages as TaskMessageDTO[] });
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/messages error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<TaskMessageDTO>>> {
  try {
    const body = await request.json();
    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json(
        { success: false, error: "role and content are required" },
        { status: 400 }
      );
    }

    const message = await prisma.taskMessage.create({
      data: {
        taskId: params.id,
        role,
        content,
      },
    });

    await createAuditLog({
      taskId: params.id,
      entity: "TaskMessage",
      entityId: message.id,
      action: "CREATE",
      after: message,
    });

    return NextResponse.json({ success: true, data: message as TaskMessageDTO }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/messages error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
