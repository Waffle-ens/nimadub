import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, ProjectDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProjectDTO | null>>> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error(`GET /api/projects/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProjectDTO>>> {
  try {
    const body = await request.json();
    const { name, description } = body;

    const before = await prisma.project.findUnique({
      where: { id: params.id },
    });

    const project = await prisma.project.update({
      where: { id: params.id },
      data: { name, description },
    });

    await createAuditLog({
      entity: "Project",
      entityId: project.id,
      action: "UPDATE",
      before,
      after: project,
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error(`PUT /api/projects/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const before = await prisma.project.findUnique({
      where: { id: params.id },
    });

    await prisma.project.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      entity: "Project",
      entityId: params.id,
      action: "DELETE",
      before,
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error(`DELETE /api/projects/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
