import { z } from "zod";

export const ProgressStatusEnum = z.enum([
  "UNATTEMPTED",
  "IN_PROGRESS",
  "SOLVED",
  "REVIEW_NEEDED",
]);

export const ProgressSyncItemSchema = z.object({
  paperId: z.string().min(1, "paperId is required"),
  status: ProgressStatusEnum.default("IN_PROGRESS"),
  scoreAchieved: z.number().min(0).default(0),
  timeSpentSecs: z.number().int().min(0).default(0),
  answersJson: z.record(z.any()).default({}),
  updatedAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
});

export const ProgressSyncSchema = z.object({
  items: z
    .array(ProgressSyncItemSchema)
    .min(1, "At least one progress item is required to sync"),
});

export type ProgressSyncInput = z.infer<typeof ProgressSyncSchema>;
export type ProgressSyncItem = z.infer<typeof ProgressSyncItemSchema>;

export const ProgressPatchSchema = z.object({
  status: ProgressStatusEnum.optional(),
  scoreAchieved: z.number().min(0).optional(),
  timeSpentSecs: z.number().int().min(0).optional(),
  answersJson: z.record(z.any()).optional(),
});

export type ProgressPatchInput = z.infer<typeof ProgressPatchSchema>;

