import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getChapterForStaff, getTopicsForChapter } from "@/lib/curriculum-data";
import { getQuizzesForChapterStaff } from "@/lib/quiz-data";
import { QuizManager } from "@/components/staff/content/quiz-manager";

export default async function QuizzesChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const { chapterId } = await params;

  const chapter = await getChapterForStaff(chapterId);
  if (!chapter) notFound();

  const [quizzes, topics] = await Promise.all([
    getQuizzesForChapterStaff(chapterId),
    getTopicsForChapter(chapterId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-text-secondary text-xs">
          {chapter.paper.subject.track.name} · {chapter.paper.subject.name} · {chapter.paper.name}
        </p>
        <h1 className="font-display text-foreground text-2xl">{chapter.name}</h1>
      </div>
      <QuizManager chapterId={chapterId} quizzes={quizzes} topics={topics} />
    </div>
  );
}