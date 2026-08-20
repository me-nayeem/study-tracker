import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { prisma } from "@/lib/prisma";
import { getActiveQuizForChapter, getQuizCooldown } from "@/lib/quiz-data";
import { QuizTakingForm } from "@/components/student/quiz-taking-form";

export default async function ChapterQuizPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) notFound();

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, isArchived: false },
    select: { id: true, name: true, paper: { select: { subject: { select: { trackId: true } } } } },
  });

  if (!chapter || chapter.paper.subject.trackId !== profile.trackId) {
    notFound();
  }

  const chapterMastery = await prisma.chapterMastery.findUnique({
    where: { studentId_chapterId: { studentId: profile.id, chapterId } },
  });

  if (
    !chapterMastery ||
    (chapterMastery.status !== "AWAITING_QUIZ" && chapterMastery.status !== "NEEDS_REVIEW")
  ) {
    notFound();
  }

  if (chapterMastery.status === "NEEDS_REVIEW") {
    const { onCooldown, availableAt, minutesLeft } = await getQuizCooldown(chapterMastery.id);
    if (onCooldown && availableAt) {
      return (
        <div className="space-y-4">
          <Link
            href={`/chapter/${chapterId}`}
            className="text-text-secondary text-xs hover:underline"
          >
            ← {chapter.name}
          </Link>
          <div className="border-bg-elevated bg-bg-surface rounded-xl border p-6 text-center">
            <h1 className="font-display text-foreground text-xl">Retake available soon</h1>
            <p className="text-text-secondary mt-2 text-sm">
              You can retake this quiz in {minutesLeft} minute(s).
            </p>
          </div>
        </div>
      );
    }
  }

  const quiz = await getActiveQuizForChapter(chapterId);
  if (!quiz || quiz.questions.length === 0) notFound();

  const questionsForClient = quiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: (q.options as string[]).map((text, index) => ({ index, text })),
  }));

  return (
    <div className="space-y-6">
      <Link href={`/chapter/${chapterId}`} className="text-text-secondary text-xs hover:underline">
        ← {chapter.name}
      </Link>
      <div>
        <h1 className="font-display text-foreground text-2xl">{quiz.title}</h1>
        <p className="text-text-secondary mt-1 text-sm">{chapter.name}</p>
      </div>
      <QuizTakingForm
  chapterId={chapterId}
  quizId={quiz.id}
  questions={questionsForClient}
  timeLimitMinutes={quiz.timeLimitMinutes}
/>
    </div>
  );
}
