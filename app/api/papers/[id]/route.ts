import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/papers/[id]
 * Returns full paper metadata, associated questions (sorted),
 * linked mark scheme reference, and user context if logged in.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return apiError("Paper ID is required", 400);
    }

    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            board: {
              select: { id: true, name: true, isActive: true },
            },
          },
        },
        questions: {
          orderBy: { questionNum: "asc" },
        },
        markScheme: {
          select: {
            id: true,
            subjectId: true,
            year: true,
            session: true,
            variant: true,
            paperType: true,
            fileKey: true,
            totalMarks: true,
            durationMins: true,
          },
        },
        linkedPapers: {
          select: {
            id: true,
            paperType: true,
            fileKey: true,
            variant: true,
          },
        },
      },
    });

    if (!paper) {
      return apiError("Paper not found", 404);
    }

    // Check optional authenticated user progress & bookmark status
    const user = await getAuthenticatedUser(request);
    let userProgress = null;
    let isBookmarked = false;

    if (user) {
      const [progressRecord, bookmarkRecord] = await Promise.all([
        prisma.userProgress.findUnique({
          where: {
            userId_paperId: {
              userId: user.id,
              paperId: paper.id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            userId_paperId: {
              userId: user.id,
              paperId: paper.id,
            },
          },
        }),
      ]);
      userProgress = progressRecord;
      isBookmarked = !!bookmarkRecord;
    }

    return apiSuccess({
      ...paper,
      userProgress,
      isBookmarked,
    });
  } catch (error) {
    console.error("Error retrieving paper by id:", error);
    return apiError("Failed to retrieve paper", 500);
  }
}

