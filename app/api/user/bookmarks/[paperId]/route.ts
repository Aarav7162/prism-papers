import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ paperId: string }>;
}

/**
 * DELETE /api/user/bookmarks/[paperId]
 * Removes a paper from the authenticated user's bookmarks.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Please sign in to remove bookmark.", 401);
    }

    const { paperId } = await context.params;

    if (!paperId) {
      return apiError("Paper ID is required", 400);
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        paperId,
      },
    });

    return apiSuccess({ bookmarked: false, paperId });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return apiError("Failed to remove bookmark", 500);
  }
}

