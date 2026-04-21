import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, MemorySnapshotDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MemorySnapshotDTO[]>>> {
  try {
    const snapshots = await prisma.memorySnapshot.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: snapshots as MemorySnapshotDTO[] });
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/memory-snapshots error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch memory snapshots" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MemorySnapshotDTO>>> {
  try {
    const body = await request.json();
    const { type, title, content } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, error: "type, title, content are required" },
        { status: 400 }
      );
    }

    const snapshot = await prisma.memorySnapshot.create({
      data: {
        taskId: params.id,
        type,
        title,
        content,
      },
    });

    await createAuditLog({
      taskId: params.id,
      entity: "MemorySnapshot",
      entityId: snapshot.id,
      action: "CREATE",
      after: snapshot,
    });

    return NextResponse.json({ success: true, data: snapshot as MemorySnapshotDTO }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/memory-snapshots error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to create memory snapshot" },
      { status: 500 }
    );
  }
}
