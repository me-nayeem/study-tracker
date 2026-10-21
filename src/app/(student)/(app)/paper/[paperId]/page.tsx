import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getPaperDetail } from "@/lib/student-data";
import { computeSubjectProgress, computeChapterProgress } from "@/lib/progress";
import { ChapterCard } from "@/components/student/chapter-card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { backPillClass } from "@/components/shared/classes";

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const data = await getPaperDetail(paperId, profile.id, profile.trackId);
  if (!data) {
    notFound();
  }

  const { paper, topicProgressByTopicId, chapterMasteryByChapterId } = data;
  const paperPercent = Math.min(
    100,
    Math.max(0, computeSubjectProgress(paper.chapters, topicProgressByTopicId))
  );
  const masteredCount = paper.chapters.filter(
    (chapter) => chapterMasteryByChapterId.get(chapter.id)?.status === "MASTERED"
  ).length;

  return (
    <div className="space-y-6">
      <section className="card-surface p-4 sm:p-6">
        <Link href="/dashboard" className={backPillClass}>
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          Dashboard
        </Link>

        <p className="text-text-secondary mt-3 text-xs sm:text-sm">{paper.subject.name}</p>
        <h1 className="font-display text-foreground text-2xl leading-tight capitalize sm:text-3xl">
          {paper.name}
        </h1>

        <div className="mt-3 flex items-center gap-3 sm:max-w-md">
          <ProgressBar percent={paperPercent} className="h-1.5 flex-1" />
          <span className="text-gold text-sm font-semibold tabular-nums">
            {Math.round(paperPercent)}%
          </span>
        </div>
        {paper.chapters.length > 0 && (
          <p className="text-text-secondary mt-2 text-xs">
            {masteredCount}/{paper.chapters.length} chapters mastered
          </p>
        )}
      </section>

      {paper.chapters.length === 0 ? (
        <div className="card-surface px-6 py-10 text-center">
          <p className="text-text-secondary text-sm">No chapters added yet.</p>
        </div>
      ) : (
        <div className="grid max-w-6xl grid-cols-1 gap-x-4 gap-y-5 pb-4 md:grid-cols-2">
          {paper.chapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              percent={computeChapterProgress(chapter.topics, topicProgressByTopicId)}
              status={chapterMasteryByChapterId.get(chapter.id)?.status ?? "NOT_STARTED"}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
