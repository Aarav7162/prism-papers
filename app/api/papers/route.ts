import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PaperFilterSchema } from "@/lib/validations/papers";
import { Prisma } from "@prisma/client";

/**
 * GET /api/papers
 * Filterable by:
 * - boardId
 * - subjectId
 * - year
 * - session
 * - variant
 * - paperType
 * - gradeLevel
 * - search
 * Includes pagination and cursor-based loading.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = PaperFilterSchema.safeParse(rawParams);
    if (!validationResult.success) {
      return apiError(
        "Invalid query parameters",
        400,
        validationResult.error.format()
      );
    }

    const {
      boardId,
      subjectId,
      year,
      session,
      variant,
      paperType,
      gradeLevel,
      search,
      limit,
      page,
      cursor,
    } = validationResult.data;

    // Build Prisma where clause
    const where: Prisma.PaperWhereInput = {
      ...(subjectId ? { subjectId } : {}),
      ...(year ? { year } : {}),
      ...(session ? { session: { contains: session, mode: "insensitive" } } : {}),
      ...(variant ? { variant: { contains: variant, mode: "insensitive" } } : {}),
      ...(paperType ? { paperType } : {}),
      ...(boardId || gradeLevel
        ? {
            subject: {
              ...(boardId ? { boardId } : {}),
              ...(gradeLevel
                ? { gradeLevel: { contains: gradeLevel, mode: "insensitive" } }
                : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { session: { contains: search, mode: "insensitive" } },
              { variant: { contains: search, mode: "insensitive" } },
              {
                subject: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { code: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    // If cursor is provided, use cursor-based pagination
    if (cursor) {
      const papers = await prisma.paper.findMany({
        take: limit + 1,
        skip: 1,
        cursor: { id: cursor },
        where,
        include: {
          subject: {
            include: {
              board: {
                select: { id: true, name: true },
              },
            },
          },
          markScheme: {
            select: { id: true, fileKey: true, paperType: true },
          },
          _count: {
            select: { questions: true },
          },
        },
        orderBy: [{ year: "desc" }, { session: "asc" }, { id: "asc" }],
      });

      const hasMore = papers.length > limit;
      const items = hasMore ? papers.slice(0, limit) : papers;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return apiSuccess({
        items,
        pagination: {
          type: "cursor",
          limit,
          hasMore,
          nextCursor,
        },
      });
    }

    // Default: offset-based pagination with total count
    const skip = (page - 1) * limit;

    const [total, papers] = await Promise.all([
      prisma.paper.count({ where }),
      prisma.paper.findMany({
        skip,
        take: limit,
        where,
        include: {
          subject: {
            include: {
              board: {
                select: { id: true, name: true },
              },
            },
          },
          markScheme: {
            select: { id: true, fileKey: true, paperType: true },
          },
          _count: {
            select: { questions: true },
          },
        },
        orderBy: [{ year: "desc" }, { session: "asc" }, { id: "asc" }],
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess({
      items: papers,
      pagination: {
        type: "offset",
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
        nextCursor: papers.length > 0 ? papers[papers.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return apiError("Failed to fetch papers", 500);
  }
}

