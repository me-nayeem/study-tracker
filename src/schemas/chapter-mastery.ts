import { z } from "zod";

export const MarkChapterCompleteSchema = z.object({
  chapterId: z.string().min(1, "Missing id."),
});