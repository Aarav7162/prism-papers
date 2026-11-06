import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/boards
 * Returns all active boards and subject counts.
 * Optional query param: ?includeInactive=true to also view upcoming boards (e.g. IB)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const boards = await prisma.board.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        _count: {
          select: { subjects: true },
        },
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
            _count: {
              select: { papers: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedBoards = boards.map((board) => ({
      id: board.id,
      name: board.name,
      isActive: board.isActive,
      subjectCount: board._count.subjects,
      subjects: board.subjects.map((sub) => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        gradeLevel: sub.gradeLevel,
        paperCount: sub._count.papers,
      })),
    }));

    return apiSuccess(formattedBoards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return apiError("Failed to fetch boards", 500);
  }
}

