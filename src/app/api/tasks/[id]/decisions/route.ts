import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, DecisionDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<DecisionDTO[]>>> {
  try {
    const decisions = await prisma.decision.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: decisions });
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/decisions error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<DecisionDTO>>> {
  try {
    const body = await request.json();
    const { title, context, decision, rationale } = body;

    if (!title || !context || !decision) {
      return NextResponse.json(
        { success: false, error: "title, context, decision are required" },
        { status: 400 }
      );
    }

    const result = await prisma.decision.create({
      data: {
        taskId: params.id,
        title,
        context,
        decision,
        rationale,
      },
    });

    await createAuditLog({
      taskId: params.id,
      entity: "Decision",
      entityId: result.id,
      action: "CREATE",
      after: result,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/decisions error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to create decision" },
      { status: 500 }
    );
  }
}
