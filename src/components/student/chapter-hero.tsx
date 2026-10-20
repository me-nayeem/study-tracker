import Link from "next/link";
import { ChevronLeft, Lock, PlayCircle, RotateCcw, Trophy } from "lucide-react";
import type { MasteryStatus } from "@/generated/prisma/enums";
import { getSubjectArt } from "@/lib/subject-art";
import { buttonGoldClass } from "@/components/shared/classes";
import { MarkCompleteButton } from "./mark-complete-button";
import { MasteryPill } from "./mastery-badge";

export function ChapterHero({
  chapter,
  percent,
  topicsDone,
  topicCount,
  status,
  hasCoreAccess,
}: {
  chapter: {
    id: string;
    name: string;
    paperId: string;
    paper: { name: string; subject: { name: string } };
  };
  percent: number;
  topicsDone: number;
  topicCount: number;
  status: MasteryStatus;
  hasCoreAccess: boolean;
}) {
  const accent = getSubjectArt(chapter.paper.subject.name).accent;
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <section
      className="border-gold/20 from-bg-surface to-ink relative overflow-hidden rounded-2xl border bg-linear-to-b p-4 sm:p-6"
      style={{ "--card-accent": accent } as React.CSSProperties}
    >
      {/* subject-coloured glow */}
      <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-(--card-accent) opacity-20 blur-3xl" />

      <Link
        href={`/paper/${chapter.paperId}`}
        className="border-gold/30 text-gold-soft/80 hover:border-gold hover:text-gold-soft relative inline-flex max-w-full items-center gap-1 rounded-full border bg-black/30 py-1 pr-3 pl-2 text-xs transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {chapter.paper.subject.name} · <span className="capitalize">{chapter.paper.name}</span>
        </span>
      </Link>

      <div className="relative mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
            {chapter.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MasteryPill status={status} />
            {!hasCoreAccess && (
              <span className="border-gold/40 bg-gold/10 text-gold-soft inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                <Lock className="h-3 w-3" />
                Pro
              </span>
            )}
            {topicCount > 0 && (
              <span className="text-text-secondary text-xs">
                {topicsDone}/{topicCount} topics done
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 sm:w-96">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="from-gold-deep via-gold to-gold-soft h-full rounded-full bg-linear-to-r shadow-[0_0_12px_rgba(214,166,72,0.5)] transition-all duration-500"
                style={{ width: `${clamped}%` }}
              />
            </div>
            <span className="gold-text font-mono text-sm font-semibold tabular-nums">
              {Math.round(clamped)}%
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <ChapterAction chapterId={chapter.id} status={status} hasCoreAccess={hasCoreAccess} />
        </div>
      </div>
    </section>
  );
}

function ChapterAction({
  chapterId,
  status,
  hasCoreAccess,
}: {
  chapterId: string;
  status: MasteryStatus;
  hasCoreAccess: boolean;
}) {
  if (!hasCoreAccess) return null;

  if (status === "NOT_STARTED" || status === "IN_PROGRESS") {
    return <MarkCompleteButton chapterId={chapterId} />;
  }

  if (status === "AWAITING_QUIZ" || status === "NEEDS_REVIEW") {
    const retake = status === "NEEDS_REVIEW";
    const Icon = retake ? RotateCcw : PlayCircle;
    return (
      <Link href={`/chapter/${chapterId}/quiz`} className={`${buttonGoldClass} w-full sm:w-auto`}>
        <Icon className="h-4 w-4" />
        {retake ? "Retake quiz" : "Take quiz"}
      </Link>
    );
  }

  return (
    <span className="border-state-success/30 bg-state-success/10 text-state-success inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold sm:w-auto">
      <Trophy className="h-4 w-4" />
      Chapter mastered
    </span>
  );
}
