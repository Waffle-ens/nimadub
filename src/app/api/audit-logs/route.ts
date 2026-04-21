import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, AuditLogDTO } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AuditLogDTO[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const entity = searchParams.get("entity");
    const limit = parseInt(searchParams.get("limit") || "100");

    const logs = await prisma.auditLog.findMany({
      where: {
        taskId: taskId ?? undefined,
        entity: entity ?? undefined,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("GET /api/audit-logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
