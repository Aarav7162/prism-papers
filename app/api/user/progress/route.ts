import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/user/progress
 * Fetches the authenticated user's entire completion matrix, scores, active papers,
 * and high-level progress KPIs.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Please provide authentication credentials.", 401);
    }

    const progressRecords = await prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        paper: {
          select: {
            id: true,
            year: true,
            session: true,
            variant: true,
            paperType: true,
            totalMarks: true,
            durationMins: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                gradeLevel: true,
                board: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Compute aggregated KPI summary
    const totalAttempted = progressRecords.length;
    const totalSolved = progressRecords.filter(
      (p) => p.status === "SOLVED"
    ).length;
    const inProgressCount = progressRecords.filter(
      (p) => p.status === "IN_PROGRESS"
    ).length;
    const reviewNeededCount = progressRecords.filter(
      (p) => p.status === "REVIEW_NEEDED"
    ).length;

    const totalTimeSpentSecs = progressRecords.reduce(
      (acc, p) => acc + p.timeSpentSecs,
      0
    );

    let totalScoreObtained = 0;
    let totalScorePossible = 0;

    for (const record of progressRecords) {
      if (record.paper.totalMarks > 0) {
        totalScoreObtained += record.scoreAchieved;
        totalScorePossible += record.paper.totalMarks;
      }
    }

    const averageAccuracyPercent =
      totalScorePossible > 0
        ? Number(((totalScoreObtained / totalScorePossible) * 100).toFixed(1))
        : 0;

    return apiSuccess({
      summary: {
        totalAttempted,
        totalSolved,
        inProgressCount,
        reviewNeededCount,
        totalTimeSpentSecs,
        totalTimeSpentHours: Number((totalTimeSpentSecs / 3600).toFixed(2)),
        averageAccuracyPercent,
      },
      items: progressRecords,
    });
  } catch (error) {
    console.error("Error retrieving user progress:", error);
    return apiError("Failed to fetch user progress", 500);
  }
}

