import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";
import { ProgressSyncSchema } from "@/lib/validations/user-progress";

/**
 * POST /api/user/progress/sync
 * Offline sync bridge for syncing local-first browser localStorage state into PostgreSQL.
 *
 * Requirements:
 * - Atomic upserts (Prisma.userProgress.upsert inside a transaction).
 * - Merge conflict rule: Preserve the record with the higher updatedAt timestamp or higher scoreAchieved.
 * - Returns merged and reconciled progress state to update client storage.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Authentication required for syncing progress.", 401);
    }

    const body = await request.json();
    const validationResult = ProgressSyncSchema.safeParse(body);

    if (!validationResult.success) {
      return apiError(
        "Invalid progress sync payload",
        400,
        validationResult.error.format()
      );
    }

    const { items } = validationResult.data;
    const paperIds = items.map((i) => i.paperId);

    // Verify which papers exist in the database to prevent foreign key errors
    const validPapers = await prisma.paper.findMany({
      where: { id: { in: paperIds } },
      select: { id: true },
    });
    const validPaperIdSet = new Set(validPapers.map((p) => p.id));

    // Fetch existing records for this user matching incoming papers
    const existingRecords = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        paperId: { in: paperIds },
      },
    });

    const existingMap = new Map(existingRecords.map((r) => [r.paperId, r]));

    // Perform atomic transaction
    const syncOperations = items
      .filter((incoming) => validPaperIdSet.has(incoming.paperId))
      .map((incoming) => {
        const existing = existingMap.get(incoming.paperId);

        if (!existing) {
          // Brand new record: Create via upsert
          return prisma.userProgress.upsert({
            where: {
              userId_paperId: {
                userId: user.id,
                paperId: incoming.paperId,
              },
            },
            create: {
              userId: user.id,
              paperId: incoming.paperId,
              status: incoming.status,
              scoreAchieved: incoming.scoreAchieved,
              timeSpentSecs: incoming.timeSpentSecs,
              answersJson: incoming.answersJson,
              updatedAt: incoming.updatedAt,
            },
            update: {
              status: incoming.status,
              scoreAchieved: incoming.scoreAchieved,
              timeSpentSecs: incoming.timeSpentSecs,
              answersJson: incoming.answersJson,
              updatedAt: incoming.updatedAt,
            },
          });
        }

        // Merge conflict resolution:
        // "Preserve the record with the higher updatedAt timestamp or higher scoreAchieved."
        const incomingTime = incoming.updatedAt.getTime();
        const existingTime = existing.updatedAt.getTime();
        const incomingWins =
          incomingTime > existingTime ||
          incoming.scoreAchieved > existing.scoreAchieved;

        if (incomingWins) {
          return prisma.userProgress.update({
            where: { id: existing.id },
            data: {
              status: incoming.status,
              scoreAchieved: incoming.scoreAchieved,
              timeSpentSecs: incoming.timeSpentSecs,
              answersJson: incoming.answersJson,
              updatedAt: incoming.updatedAt,
            },
          });
        }

        // Existing server record is newer or has higher score: preserve existing record
        return prisma.userProgress.findUniqueOrThrow({
          where: { id: existing.id },
        });
      });

    const reconciledRecords = await prisma.$transaction(syncOperations);

    return apiSuccess({
      syncedCount: reconciledRecords.length,
      records: reconciledRecords,
    });
  } catch (error) {
    console.error("Error during progress sync:", error);
    return apiError("Failed to sync user progress", 500);
  }
}

