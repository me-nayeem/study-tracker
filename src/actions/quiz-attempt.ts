"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getQuizCooldown } from "@/lib/quiz-data";
import { fieldErrorState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { SubmitQuizAttemptSchema } from "@/schemas/quiz-attempt";

const COOLDOWN_MINUTES = 60;

export type QuestionResult = {
  questionId: string;
  questionText: string;
  isCorrect: boolean;
  correctIndex: number;
  selectedIndex: number | null;
  explanation: string | null;
  topicName: string | null;
};

export type SubmitQuizAttemptState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  result?: {
    percent: number;
    passed: boolean;
    questionResults: QuestionResult[];
  };
};

export async function submitQuizAttempt(
  _prev: SubmitQuizAttemptState,
  formData: FormData
): Promise<SubmitQuizAttemptState> {
  const user = await requireUser();

  const parsed = SubmitQuizAttemptSchema.safeParse({
    quizId: formValue(formData, "quizId"),
    chapterId: formValue(formData, "chapterId"),
    answers: formValue(formData, "answers"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { quizId, chapterId, answers } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, isArchived: false },
    select: {
      id: true,
      name: true,
      masteryPassPercent: true,
      paper: { select: { subject: { select: { trackId: true } } } },
    },
  });

  if (!chapter || chapter.paper.subject.trackId !== profile.trackId) {
    return { success: false, error: "Chapter not found." };
  }

  const chapterMastery = await prisma.chapterMastery.findUnique({
    where: { studentId_chapterId: { studentId: profile.id, chapterId } },
  });

  if (
    !chapterMastery ||
    (chapterMastery.status !== "AWAITING_QUIZ" && chapterMastery.status !== "NEEDS_REVIEW")
  ) {
    return { success: false, error: "This chapter isn't awaiting a quiz." };
  }

  if (chapterMastery.status === "NEEDS_REVIEW") {
    const { onCooldown, availableAt } = await getQuizCooldown(chapterMastery.id);
    if (onCooldown && availableAt) {
      const minutesLeft = Math.ceil((availableAt.getTime() - Date.now()) / 60000);
      return { success: false, error: `Retake available in ${minutesLeft} minute(s).` };
    }
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, chapterId },
    include: { questions: { include: { topic: { select: { name: true } } } } },
  });

  if (!quiz || quiz.questions.length === 0) {
    return { success: false, error: "Quiz not found." };
  }

  let correctCount = 0;
  const questionResults: QuestionResult[] = quiz.questions.map((q) => {
    const selectedIndex = answers[q.id] ?? null;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.questionText,
      isCorrect,
      correctIndex: q.correctIndex,
      selectedIndex,
      explanation: q.explanation,
      topicName: q.topic?.name ?? null,
    };
  });

  const totalQuestions = quiz.questions.length;
  const percent = Math.round((correctCount / totalQuestions) * 100);
  const passed = percent >= chapter.masteryPassPercent;
  const newStatus = passed ? "MASTERED" : "NEEDS_REVIEW";
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.create({
      data: {
        studentId: profile.id,
        quizId,
        chapterMasteryId: chapterMastery.id,
        context: "AUTO_VALIDATION",
        score: correctCount,
        totalQuestions,
        answers,
        attemptedAt: now,
      },
    });

    await tx.chapterMastery.update({
      where: { id: chapterMastery.id },
      data: {
        status: newStatus,
        masteredAt: passed ? now : chapterMastery.masteredAt,
      },
    });

    if (!passed) {
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "CHAPTER_NEEDS_REVIEW",
          title: `Review needed: ${chapter.name}`,
          body: `You scored ${percent}% (need ${chapter.masteryPassPercent}%). Review the topics below and retake in ${COOLDOWN_MINUTES} minutes.`,
          isRead: false,
        },
      });
    }
  });

  revalidatePath(`/chapter/${chapterId}`);
  revalidatePath(`/chapter/${chapterId}/quiz`);
  revalidatePath("/dashboard");
  revalidatePath("/quiz-results");

  return { success: true, result: { percent, passed, questionResults } };
}