import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { DOCUMENT_TYPE } from "@/types";
import type { ApiResponse, DocumentDTO, DocumentType } from "@/types";

const VALID_TYPES = Object.values(DOCUMENT_TYPE);

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DocumentDTO[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");
    const type = searchParams.get("type");

    const validatedType =
      type && VALID_TYPES.includes(type as DocumentType)
        ? (type as DocumentType)
        : undefined;

    const documents = await prisma.document.findMany({
      where: {
        projectId: projectId ?? undefined,
        taskId: taskId ?? undefined,
        type: validatedType,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: documents as DocumentDTO[] });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<DocumentDTO>>> {
  try {
    const body = await request.json();
    const { projectId, taskId, title, type, content } = body;

    if (!title || !type || !content) {
      return NextResponse.json(
        { success: false, error: "title, type, content are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type as DocumentType)) {
      return NextResponse.json(
        { success: false, error: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: { projectId, taskId, title, type, content },
    });

    await createAuditLog({
      taskId,
      entity: "Document",
      entityId: document.id,
      action: "CREATE",
      after: document,
    });

    return NextResponse.json({ success: true, data: document as DocumentDTO }, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create document" },
      { status: 500 }
    );
  }
}
