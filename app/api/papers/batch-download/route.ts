import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { BatchDownloadSchema } from "@/lib/validations/papers";
import { generateR2PresignedUrl, PRESIGNED_URL_TTL_SECONDS, r2Client, isR2Configured } from "@/lib/r2";
import { env } from "@/lib/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import archiver from "archiver";
import { Readable, PassThrough } from "stream";
import fs from "fs";
import path from "path";

/**
 * POST /api/papers/batch-download
 * Body: { paperIds: string[], zipStream?: boolean }
 *
 * Supports two operational modes:
 * 1. Default (zipStream = false): Returns an array of secure 15-minute presigned URLs for client-side parallel fetching.
 * 2. Streaming Zip (zipStream = true): Dynamically pipes compressed PDF streams into a single .zip download
 *    without buffering in server memory, keeping runtime cost strictly within $0 free tier limits.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = BatchDownloadSchema.safeParse(body);

    if (!validationResult.success) {
      return apiError(
        "Invalid batch download request",
        400,
        validationResult.error.format()
      );
    }

    const { paperIds, zipStream } = validationResult.data;

    // Fetch all requested papers from database
    const papers = await prisma.paper.findMany({
      where: {
        id: { in: paperIds },
      },
      include: {
        subject: {
          select: { code: true, name: true, gradeLevel: true },
        },
      },
    });

    if (papers.length === 0) {
      return apiError("No matching papers found for provided IDs", 404);
    }

    // Mode 1: Return array of Presigned URLs (Recommended for zero-egress, lowest server load)
    if (!zipStream) {
      const presignedResults = await Promise.all(
        papers.map(async (paper) => {
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
            paperId: paper.id,
            subject: paper.subject.name,
            code: paper.subject.code,
            year: paper.year,
            session: paper.session,
            variant: paper.variant,
            paperType: paper.paperType,
            filename,
            url,
            expiresIn: PRESIGNED_URL_TTL_SECONDS,
          };
        })
      );

      return apiSuccess({
        count: presignedResults.length,
        papers: presignedResults,
      });
    }

    // Mode 2: Dynamic streaming zip archive without buffering in memory
    const passThrough = new PassThrough();
    const archive = archiver("zip", {
      zlib: { level: 1 }, // Fast compression to save CPU/memory
    });

    archive.on("error", (err) => {
      console.error("Archiver stream error:", err);
      passThrough.destroy(err);
    });

    // Pipe archiver output directly to PassThrough stream
    archive.pipe(passThrough);

    // Asynchronously stream files into archive
    (async () => {
      try {
        for (const paper of papers) {
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

          if (!isR2Configured) {
            const localPath = path.join(process.cwd(), "public", paper.fileKey);
            if (fs.existsSync(localPath)) {
              archive.file(localPath, { name: filename });
            } else {
              // Fallback mock content if file does not exist locally
              const placeholderContent = `PRISM Examination Past Paper\nSubject: ${paper.subject.name} (${paper.subject.code})\nYear: ${paper.year} | Session: ${paper.session} | Variant: ${paper.variant}\nType: ${paper.paperType}\nKey: ${paper.fileKey}\n`;
              archive.append(placeholderContent, { name: filename });
            }
          } else {
            // Fetch object stream directly from Cloudflare R2
            try {
              const command = new GetObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: paper.fileKey,
              });
              const response = await r2Client.send(command);

              if (response.Body) {
                const stream = response.Body as unknown as Readable;
                archive.append(stream, { name: filename });
              }
            } catch (s3Err) {
              console.warn(`Could not stream file ${paper.fileKey} from R2:`, s3Err);
              archive.append(`File unavailable: ${paper.fileKey}`, {
                name: `${filename}.unavailable.txt`,
              });
            }
          }
        }

        // Add a manifest file describing the package
        const manifest = {
          generatedAt: new Date().toISOString(),
          totalPapers: papers.length,
          papers: papers.map((p) => ({
            id: p.id,
            subject: p.subject.name,
            year: p.year,
            session: p.session,
            variant: p.variant,
            type: p.paperType,
          })),
        };
        archive.append(JSON.stringify(manifest, null, 2), {
          name: "manifest.json",
        });

        await archive.finalize();
      } catch (streamErr) {
        console.error("Error finalizing zip stream:", streamErr);
        passThrough.destroy(streamErr as Error);
      }
    })();

    // Convert Node PassThrough stream to Web ReadableStream for Next.js Response
    const webStream = new ReadableStream({
      start(controller) {
        passThrough.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        passThrough.on("end", () => {
          controller.close();
        });
        passThrough.on("error", (err) => {
          controller.error(err);
        });
      },
      cancel() {
        passThrough.destroy();
      },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="prism_papers_${timestamp}.zip"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error in batch-download endpoint:", error);
    return apiError("Failed to process batch download request", 500);
  }
}

