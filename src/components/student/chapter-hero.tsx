import Link from "next/link";
import { ChevronLeft, Lock, LogIn, PlayCircle, RotateCcw, Trophy } from "lucide-react";
import type { MasteryStatus } from "@/generated/prisma/enums";
import { backPillClass, buttonGoldClass } from "@/components/shared/classes";
import { ProgressBar } from "@/components/shared/progress-bar";
import { loginHref } from "@/lib/login-redirect";
import { MarkCompleteButton } from "./mark-complete-button";
import { MasteryPill } from "./mastery-badge";

export function ChapterHero({
  chapter,
  percent,
  topicsDone,
  topicCount,
  status,
  hasCoreAccess,
  guest = false,
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
  /** visitor who isn't signed in: no progress, and a sign-in button instead of the chapter action */
  guest?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <section className="card-surface p-4 sm:p-6">
      <Link href={`/paper/${chapter.paperId}`} className={backPillClass}>
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {chapter.paper.subject.name} · <span className="capitalize">{chapter.paper.name}</span>
        </span>
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
            {chapter.name}
          </h1>

          {guest ? (
            <p className="text-text-secondary mt-2 text-xs sm:text-sm">
              {topicCount > 0 ? `${topicCount} topics · ` : ""}Sign in to track your progress and
              take the chapter quiz.
            </p>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <MasteryPill status={status} />
                {!hasCoreAccess && (
                  <span className="bg-gold/10 text-gold inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
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
                <ProgressBar percent={clamped} className="h-1.5 flex-1" />
                <span className="text-gold text-sm font-semibold tabular-nums">
                  {Math.round(clamped)}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className="shrink-0">
          {guest ? (
            <Link
              href={loginHref(`/chapter/${chapter.id}`)}
              className={`${buttonGoldClass} w-full sm:w-auto`}
            >
              <LogIn className="h-4 w-4" />
              Sign in to start
            </Link>
          ) : (
            <ChapterAction chapterId={chapter.id} status={status} hasCoreAccess={hasCoreAccess} />
          )}
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
    <span className="bg-state-success/10 text-state-success inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold sm:w-auto">
      <Trophy className="h-4 w-4" />
      Chapter mastered
    </span>
  );
}
