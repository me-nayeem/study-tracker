import { z } from "zod";

const AnswersSchema = z.record(z.string(), z.number().int().min(0));

export const SubmitQuizAttemptSchema = z.object({
  quizId: z.string().min(1, "Missing id."),
  chapterId: z.string().min(1, "Missing id."),
  answers: z.string().transform((val, ctx) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(val);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid answers payload." });
      return z.NEVER;
    }
    const result = AnswersSchema.safeParse(parsed);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: "Invalid answers payload." });
      return z.NEVER;
    }
    return result.data;
  }),
});
