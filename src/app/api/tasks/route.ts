import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, TaskDTO } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TaskDTO[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: tasks as TaskDTO[] });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TaskDTO>>> {
  try {
    const body = await request.json();
    const { projectId, title, description, acceptanceCriteria } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { success: false, error: "projectId and title are required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        acceptanceCriteria,
      },
    });

    await createAuditLog({
      taskId: task.id,
      entity: "Task",
      entityId: task.id,
      action: "CREATE",
      after: task,
    });

    return NextResponse.json({ success: true, data: task as TaskDTO }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
