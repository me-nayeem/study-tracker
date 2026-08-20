import { z } from "zod";

const id = z.string().min(1, "Missing id.");

export const QuizSchema = z.object({
  chapterId: id,
  title: z.string().trim().min(1, "Title is required.").max(160),
  timeLimitMinutes: z.coerce
    .number()
    .int()
    .min(1, "Must be at least 1 minute.")
    .max(180, "Max 180 minutes.")
    .optional(),
});
export const QuizUpdateSchema = QuizSchema.extend({ id });

const QuizQuestionBase = z.object({
  quizId: id,
  questionText: z.string().trim().min(1, "Question text is required."),
  options: z
    .array(z.string().trim().min(1, "Option text can't be empty.").max(300))
    .min(2, "At least 2 options are required.")
    .max(6, "At most 6 options are allowed."),
  correctIndex: z.coerce.number().int().min(0),
  explanation: z.string().trim().max(1000).optional(),
  topicId: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

function withCorrectIndexCheck<T extends typeof QuizQuestionBase>(schema: T) {
  return schema.refine((data) => data.correctIndex < data.options.length, {
    error: "Correct answer index is out of range.",
    path: ["correctIndex"],
  });
}

export const QuizQuestionSchema = withCorrectIndexCheck(QuizQuestionBase);
export const QuizQuestionUpdateSchema = withCorrectIndexCheck(QuizQuestionBase.extend({ id }));

export const SetQuizActiveSchema = z.object({ id, chapterId: id });
export const DeleteQuizSchema = z.object({ id });
export const DeleteQuizQuestionSchema = z.object({ id });
