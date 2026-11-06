import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";
import { ProgressPatchSchema } from "@/lib/validations/user-progress";

interface RouteContext {
  params: Promise<{ paperId: string }>;
}

/**
 * PATCH /api/user/progress/[paperId]
 * Real-time incremental auto-save endpoint for:
 * - Question scores and marks
 * - Time elapsed in session
 * - Current progress status (IN_PROGRESS, SOLVED, REVIEW_NEEDED)
 * - Canvas strokes, scratchpad drawings, and rubric evaluation JSON state
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Please sign in to save your examination progress.", 401);
    }

    const { paperId } = await context.params;

    if (!paperId) {
      return apiError("Paper ID is required", 400);
    }

    // Verify paper exists
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      select: { id: true, totalMarks: true },
    });

    if (!paper) {
      return apiError("Paper not found", 404);
    }

    const body = await request.json();
    const validationResult = ProgressPatchSchema.safeParse(body);

    if (!validationResult.success) {
      return apiError(
        "Invalid auto-save progress payload",
        400,
        validationResult.error.format()
      );
    }

    const data = validationResult.data;

    // Atomic upsert: create if not already started, otherwise update
    const updatedRecord = await prisma.userProgress.upsert({
      where: {
        userId_paperId: {
          userId: user.id,
          paperId,
        },
      },
      create: {
        userId: user.id,
        paperId,
        status: data.status ?? "IN_PROGRESS",
        scoreAchieved: data.scoreAchieved ?? 0,
        timeSpentSecs: data.timeSpentSecs ?? 0,
        answersJson: data.answersJson ?? {},
      },
      update: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.scoreAchieved !== undefined ? { scoreAchieved: data.scoreAchieved } : {}),
        ...(data.timeSpentSecs !== undefined ? { timeSpentSecs: data.timeSpentSecs } : {}),
        ...(data.answersJson ? { answersJson: data.answersJson } : {}),
      },
    });

    return apiSuccess({
      record: updatedRecord,
      totalMarks: paper.totalMarks,
      percentage:
        paper.totalMarks > 0
          ? Number(((updatedRecord.scoreAchieved / paper.totalMarks) * 100).toFixed(1))
          : 0,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return apiError("Failed to update progress", 500);
  }
}

