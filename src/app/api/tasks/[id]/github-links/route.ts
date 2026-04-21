import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import type { ApiResponse, GithubLinkDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<GithubLinkDTO[]>>> {
  try {
    const links = await prisma.githubLink.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: links as GithubLinkDTO[] });
  } catch (error) {
    console.error(`GET /api/tasks/${params.id}/github-links error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch github links" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<GithubLinkDTO>>> {
  try {
    const body = await request.json();
    const { type, url, number, title } = body;

    if (!type || !url || number === undefined) {
      return NextResponse.json(
        { success: false, error: "type, url, number are required" },
        { status: 400 }
      );
    }

    const link = await prisma.githubLink.create({
      data: {
        taskId: params.id,
        type,
        url,
        number,
        title,
      },
    });

    await createAuditLog({
      taskId: params.id,
      entity: "GithubLink",
      entityId: link.id,
      action: "CREATE",
      after: link,
    });

    return NextResponse.json({ success: true, data: link as GithubLinkDTO }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tasks/${params.id}/github-links error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to create github link" },
      { status: 500 }
    );
  }
}
