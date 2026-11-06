"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ProgressPatchSchema, ProgressSyncSchema } from "@/lib/validations/user-progress";
import { ProgressStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Save or update user progress on a paper
 */
export async function savePaperProgressAction(
  paperId: string,
  payload: {
    status?: ProgressStatus;
    scoreAchieved?: number;
    timeSpentSecs?: number;
    answersJson?: Record<string, any>;
  }
): Promise<ActionResult<any>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const validated = ProgressPatchSchema.safeParse(payload);
    if (!validated.success) {
      return { success: false, error: "Validation failed" };
    }

    const data = validated.data;

    const record = await prisma.userProgress.upsert({
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

    revalidatePath(`/papers/${paperId}`);
    return { success: true, data: record };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save progress" };
  }
}

/**
 * Server Action: Toggle paper bookmark for the current user
 */
export async function toggleBookmarkAction(
  paperId: string
): Promise<ActionResult<{ isBookmarked: boolean }>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_paperId: {
          userId: user.id,
          paperId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/papers/${paperId}`);
      return { success: true, data: { isBookmarked: false } };
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          paperId,
        },
      });
      revalidatePath(`/papers/${paperId}`);
      return { success: true, data: { isBookmarked: true } };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to toggle bookmark" };
  }
}

/**
 * Server Action: Sync local offline items
 */
export async function syncOfflineProgressAction(items: any[]): Promise<ActionResult<any>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const validated = ProgressSyncSchema.safeParse({ items });
    if (!validated.success) {
      return { success: false, error: "Validation failed" };
    }

    const paperIds = validated.data.items.map((i) => i.paperId);
    const existing = await prisma.userProgress.findMany({
      where: { userId: user.id, paperId: { in: paperIds } },
    });
    const map = new Map(existing.map((e) => [e.paperId, e]));

    const ops = validated.data.items.map((incoming) => {
      const cur = map.get(incoming.paperId);
      if (!cur) {
        return prisma.userProgress.create({
          data: {
            userId: user.id,
            paperId: incoming.paperId,
            status: incoming.status,
            scoreAchieved: incoming.scoreAchieved,
            timeSpentSecs: incoming.timeSpentSecs,
            answersJson: incoming.answersJson,
            updatedAt: incoming.updatedAt,
          },
        });
      }

      if (
        incoming.updatedAt.getTime() > cur.updatedAt.getTime() ||
        incoming.scoreAchieved > cur.scoreAchieved
      ) {
        return prisma.userProgress.update({
          where: { id: cur.id },
          data: {
            status: incoming.status,
            scoreAchieved: incoming.scoreAchieved,
            timeSpentSecs: incoming.timeSpentSecs,
            answersJson: incoming.answersJson,
            updatedAt: incoming.updatedAt,
          },
        });
      }

      return prisma.userProgress.findUniqueOrThrow({ where: { id: cur.id } });
    });

    const result = await prisma.$transaction(ops);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sync offline progress" };
  }
}

