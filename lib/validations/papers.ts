import { z } from "zod";

export const PaperTypeEnum = z.enum([
  "QUESTION_PAPER",
  "MARK_SCHEME",
  "EXAMINER_REPORT",
]);

export const PaperFilterSchema = z.object({
  boardId: z.string().optional(),
  subjectId: z.string().optional(),
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1990).max(2100).optional()),
  session: z.string().optional(),
  variant: z.string().optional(),
  paperType: PaperTypeEnum.optional(),
  gradeLevel: z.string().optional(),
  search: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  cursor: z.string().optional(),
});

export type PaperFilterInput = z.infer<typeof PaperFilterSchema>;

export const BatchDownloadSchema = z.object({
  paperIds: z
    .array(z.string().min(1))
    .min(1, "At least one paperId is required")
    .max(50, "Maximum of 50 papers can be requested in a batch"),
  zipStream: z.boolean().optional().default(false),
});

export type BatchDownloadInput = z.infer<typeof BatchDownloadSchema>;

