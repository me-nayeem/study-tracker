import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getPaperDetail } from "@/lib/student-data";
import { computeSubjectProgress, computeChapterProgress } from "@/lib/progress";
import { getSubjectArt } from "@/lib/subject-art";
import { ChapterCard } from "@/components/student/chapter-card";

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
  const accent = getSubjectArt(paper.subject.name).accent;

  return (
    <div className="space-y-6">
      <section
        className="border-gold/20 from-bg-surface to-ink relative overflow-hidden rounded-2xl border bg-linear-to-b p-4 sm:p-6"
        style={{ "--card-accent": accent } as React.CSSProperties}
      >
        <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-(--card-accent) opacity-20 blur-3xl" />

        <Link
          href="/dashboard"
          className="border-gold/30 text-gold-soft/80 hover:border-gold hover:text-gold-soft relative inline-flex items-center gap-1 rounded-full border bg-black/30 py-1 pr-3 pl-2 text-xs transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          Dashboard
        </Link>

        <p className="text-gold-soft/70 relative mt-3 text-[10px] font-medium tracking-[0.22em] uppercase sm:text-xs">
          {paper.subject.name}
        </p>
        <h1 className="font-display text-foreground relative text-2xl leading-tight capitalize sm:text-3xl">
          {paper.name}
        </h1>

        <div className="relative mt-3 flex items-center gap-3 sm:max-w-md">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="from-gold-deep via-gold to-gold-soft h-full rounded-full bg-linear-to-r shadow-[0_0_12px_rgba(214,166,72,0.5)] transition-all duration-500"
              style={{ width: `${paperPercent}%` }}
            />
          </div>
          <span className="gold-text font-mono text-sm font-semibold tabular-nums">
            {Math.round(paperPercent)}%
          </span>
        </div>
        {paper.chapters.length > 0 && (
          <p className="text-text-secondary relative mt-2 text-xs">
            {masteredCount}/{paper.chapters.length} chapters mastered
          </p>
        )}
      </section>

      {paper.chapters.length === 0 ? (
        <div className="border-gold/20 bg-bg-surface rounded-2xl border px-6 py-10 text-center">
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
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
