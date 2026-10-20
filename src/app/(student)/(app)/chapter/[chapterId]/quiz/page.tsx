import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
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
  if (!profile) {
    redirect("/onboarding");
  }

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
        <div className="max-w-3xl space-y-5">
          <BackPill chapterId={chapterId} chapterName={chapter.name} />
          <div className="border-gold/20 from-bg-surface to-ink rounded-2xl border bg-linear-to-b px-6 py-12 text-center">
            <p className="text-4xl" aria-hidden="true">
              ⏳
            </p>
            <h1 className="font-display text-foreground mt-3 text-xl">Retake available soon</h1>
            <p className="text-text-secondary mt-2 text-sm">
              You can retake this quiz in{" "}
              <span className="gold-text font-mono font-semibold">{minutesLeft}</span> minute(s).
              Use the time to review the chapter.
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
    <div className="max-w-3xl space-y-5">
      <section
        className="border-gold/20 from-bg-surface to-ink relative overflow-hidden rounded-2xl border bg-linear-to-b p-4 sm:p-6"
        style={{ "--card-accent": "#e3a857" } as React.CSSProperties}
      >
        <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-(--card-accent) opacity-20 blur-3xl" />
        <BackPill chapterId={chapterId} chapterName={chapter.name} />
        <div className="relative mt-3 flex items-center gap-3">
          <span className="border-gold/30 relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/40">
            <span className="absolute h-8 w-8 rounded-full bg-(--card-accent) opacity-30 blur-md" />
            <span aria-hidden="true" className="relative text-2xl leading-none">
              🧠
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-foreground text-2xl leading-tight">{quiz.title}</h1>
            <p className="text-text-secondary truncate text-xs sm:text-sm">{chapter.name}</p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="border-gold/30 text-gold-soft rounded-full border bg-black/40 px-3 py-1 text-xs font-medium">
            {questionsForClient.length} questions
          </span>
          {quiz.timeLimitMinutes && (
            <span className="border-gold/30 text-gold-soft rounded-full border bg-black/40 px-3 py-1 text-xs font-medium">
              {quiz.timeLimitMinutes} min
            </span>
          )}
        </div>
      </section>
      <QuizTakingForm
        chapterId={chapterId}
        quizId={quiz.id}
        questions={questionsForClient}
        timeLimitMinutes={quiz.timeLimitMinutes}
      />
    </div>
  );
}

function BackPill({ chapterId, chapterName }: { chapterId: string; chapterName: string }) {
  return (
    <Link
      href={`/chapter/${chapterId}`}
      className="border-gold/30 text-gold-soft/80 hover:border-gold hover:text-gold-soft relative inline-flex max-w-full items-center gap-1 rounded-full border bg-black/30 py-1 pr-3 pl-2 text-xs transition-colors"
    >
      <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{chapterName}</span>
    </Link>
  );
}
