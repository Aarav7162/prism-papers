"use server";

import { prisma } from "@/lib/prisma";
import { generateR2PresignedUrl, PRESIGNED_URL_TTL_SECONDS } from "@/lib/r2";
import { ActionResult } from "./progress";

/**
 * Server Action: Get short-lived 15-minute presigned viewing URL
 */
export async function getPaperViewUrlAction(
  paperId: string
): Promise<ActionResult<{ url: string; expiresIn: number; filename: string }>> {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        subject: { select: { code: true } },
      },
    });

    if (!paper) {
      return { success: false, error: "Paper not found" };
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

    const url = await generateR2PresignedUrl({
      fileKey: paper.fileKey,
      filename,
      disposition: "inline",
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });

    return {
      success: true,
      data: {
        url,
        expiresIn: PRESIGNED_URL_TTL_SECONDS,
        filename,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate view URL" };
  }
}

/**
 * Server Action: Get short-lived 15-minute presigned download URL
 */
export async function getPaperDownloadUrlAction(
  paperId: string
): Promise<ActionResult<{ url: string; expiresIn: number; filename: string }>> {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        subject: { select: { code: true } },
      },
    });

    if (!paper) {
      return { success: false, error: "Paper not found" };
    }

    const typeAbbr =
      paper.paperType === "QUESTION_PAPER"
        ? "qp"
        : paper.paperType === "MARK_SCHEME"
        ? "ms"
        : "er";

    const filename = `PRISM_${paper.subject.code}_${paper.year}_${paper.session}_${typeAbbr}_${paper.variant}.pdf`.replace(
      /[\/\s]+/g,
      "_"
    );

    const url = await generateR2PresignedUrl({
      fileKey: paper.fileKey,
      filename,
      disposition: "attachment",
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });

    return {
      success: true,
      data: {
        url,
        expiresIn: PRESIGNED_URL_TTL_SECONDS,
        filename,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate download URL" };
  }
}

