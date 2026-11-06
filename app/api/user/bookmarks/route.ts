import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const BookmarkSchema = z.object({
  paperId: z.string().min(1, "paperId is required"),
});

/**
 * GET /api/user/bookmarks
 * Returns all papers bookmarked by the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Please sign in to view bookmarks.", 401);
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        paper: {
          include: {
            subject: {
              include: {
                board: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return apiError("Failed to fetch bookmarks", 500);
  }
}

/**
 * POST /api/user/bookmarks
 * Body: { paperId: string }
 * Bookmarks a paper for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Please sign in to bookmark papers.", 401);
    }

    const body = await request.json();
    const validationResult = BookmarkSchema.safeParse(body);

    if (!validationResult.success) {
      return apiError("Invalid bookmark request", 400, validationResult.error.format());
    }

    const { paperId } = validationResult.data;

    // Verify paper exists
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      select: { id: true },
    });

    if (!paper) {
      return apiError("Paper not found", 404);
    }

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_paperId: {
          userId: user.id,
          paperId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        paperId,
      },
    });

    return apiSuccess({ bookmarked: true, bookmark }, 201);
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return apiError("Failed to bookmark paper", 500);
  }
}

