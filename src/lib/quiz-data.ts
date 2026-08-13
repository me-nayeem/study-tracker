import "server-only";
import { prisma } from "@/lib/prisma";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export async function getActiveQuizForChapter(chapterId: string) {
  return prisma.quiz.findFirst({
    where: { chapterId, isActive: true },
    include: { questions: { orderBy: { order: "asc" } } },
  });
}

export async function getQuizCooldown(chapterMasteryId: string) {
  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { chapterMasteryId, context: "AUTO_VALIDATION" },
    orderBy: { attemptedAt: "desc" },
    select: { attemptedAt: true },
  });

  if (!lastAttempt) {
    return { onCooldown: false as const, availableAt: null };
  }

  const availableAt = new Date(lastAttempt.attemptedAt.getTime() + COOLDOWN_MS);
  const onCooldown = availableAt.getTime() > Date.now();
  const minutesLeft =
    onCooldown && availableAt
      ? Math.max(0, Math.ceil((availableAt.getTime() - Date.now()) / 60000))
      : null;


  return { onCooldown, availableAt: onCooldown ? availableAt : null, minutesLeft };
}

export async function getQuizzesForChapterStaff(chapterId: string) {
  return prisma.quiz.findMany({
    where: { chapterId },
    orderBy: { createdAt: "desc" },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { attempts: true } },
    },
  });
}

export type StaffQuizRow = Awaited<ReturnType<typeof getQuizzesForChapterStaff>>[number];
export type StaffQuizQuestionRow = StaffQuizRow["questions"][number];

export async function getStudentQuizResults(studentId: string) {
  return prisma.chapterMastery.findMany({
    where: { studentId, status: { in: ["MASTERED", "NEEDS_REVIEW"] } },
    orderBy: { markedCompleteAt: "desc" },
    include: {
      chapter: {
        select: {
          id: true,
          name: true,
          paper: { select: { name: true, subject: { select: { name: true } } } },
        },
      },
      quizAttempts: {
        where: { context: "AUTO_VALIDATION" },
        orderBy: { attemptedAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getStudentQuizResultsWithReview(studentId: string) {
  const masteries = await getStudentQuizResults(studentId);

  return Promise.all(
    masteries.map(async (m) => {
      const latestAttempt = m.quizAttempts[0] ?? null;
      if (m.status !== "NEEDS_REVIEW" || !latestAttempt) {
        return { mastery: m, latestAttempt, review: null };
      }

      const quiz = await prisma.quiz.findUnique({
        where: { id: latestAttempt.quizId },
        include: {
          questions: { orderBy: { order: "asc" }, include: { topic: { select: { name: true } } } },
        },
      });

      if (!quiz) {
        return { mastery: m, latestAttempt, review: null };
      }

      const answers = latestAttempt.answers as Record<string, number>;
      const review = quiz.questions
        .map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options as string[],
          correctIndex: q.correctIndex,
          selectedIndex: answers[q.id] ?? null,
          isCorrect: answers[q.id] === q.correctIndex,
          explanation: q.explanation,
          topicName: q.topic?.name ?? null,
        }))
        .filter((q) => !q.isCorrect);

      return { mastery: m, latestAttempt, review };
    })
  );
}

export type StudentQuizResultWithReview = Awaited<
  ReturnType<typeof getStudentQuizResultsWithReview>
>[number];