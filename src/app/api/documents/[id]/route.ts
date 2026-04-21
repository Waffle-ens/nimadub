import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, DocumentDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<DocumentDTO | null>>> {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, data: document as DocumentDTO });
  } catch (error) {
    console.error(`GET /api/documents/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<DocumentDTO>>> {
  try {
    const body = await request.json();
    const { title, content } = body;

    const before = await prisma.document.findUnique({
      where: { id: params.id },
    });

    const document = await prisma.document.update({
      where: { id: params.id },
      data: { title, content },
    });

    await createAuditLog({
      entity: "Document",
      entityId: document.id,
      action: "UPDATE",
      before,
      after: document,
    });

    return NextResponse.json({ success: true, data: document as DocumentDTO });
  } catch (error) {
    console.error(`PUT /api/documents/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const before = await prisma.document.findUnique({
      where: { id: params.id },
    });

    await prisma.document.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      entity: "Document",
      entityId: params.id,
      action: "DELETE",
      before,
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error(`DELETE /api/documents/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
