import { z } from "zod";

export const CreateFeedbackSchema = z.object({
  category: z.enum(["BUG", "SUGGESTION", "GENERAL"], { error: "Select a category." }),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(2000),
});

export const FeedbackIdSchema = z.object({ id: z.string().min(1, "Missing id.") });
