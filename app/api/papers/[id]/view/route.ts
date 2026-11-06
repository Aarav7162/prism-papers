import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { generateR2PresignedUrl, PRESIGNED_URL_TTL_SECONDS } from "@/lib/r2";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/papers/[id]/view
 * Generates a short-lived (15-min) presigned URL for inline PDF streaming.
 * Zero-egress cost: Browser streams directly from Cloudflare R2 without passing through Next.js server function.
 * Query parameter `?redirect=true` performs a 307 Temporary Redirect directly to the R2 URL.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const shouldRedirect = searchParams.get("redirect") === "true";

    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        subject: {
          select: { code: true, name: true, gradeLevel: true },
        },
      },
    });

    if (!paper) {
      return apiError("Paper not found", 404);
    }

    const typeAbbr =
      paper.paperType === "QUESTION_PAPER"
        ? "qp"
        : paper.paperType === "MARK_SCHEME"
        ? "ms"
        : "er";

    const filename = `${paper.subject.code}_${paper.year}_${paper.session}_${typeAbbr}_${paper.variant}.pdf`.replace(
      /[\/\s]+/g,
      "_"
    );

    const presignedUrl = await generateR2PresignedUrl({
      fileKey: paper.fileKey,
      filename,
      disposition: "inline",
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });

    if (shouldRedirect) {
      return NextResponse.redirect(presignedUrl, {
        status: 307,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
    }

    return apiSuccess({
      paperId: paper.id,
      url: presignedUrl,
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
      filename,
      fileKey: paper.fileKey,
      paperType: paper.paperType,
    });
  } catch (error) {
    console.error("Error generating view presigned URL:", error);
    return apiError("Failed to generate PDF view stream URL", 500);
  }
}

