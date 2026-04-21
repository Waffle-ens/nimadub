import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, ApprovalDTO } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ApprovalDTO[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const taskId = searchParams.get("taskId");

    const approvals = await prisma.approval.findMany({
      where: {
        status: status ?? undefined,
        taskId: taskId ?? undefined,
      },
      include: {
        task: { select: { id: true, title: true, projectId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: approvals as ApprovalDTO[] });
  } catch (error) {
    console.error("GET /api/approvals error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}
