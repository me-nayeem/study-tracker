"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ChevronDown, RotateCcw } from "lucide-react";
import type { StudentQuizResultWithReview } from "@/lib/quiz-data";

const PASS_ACCENT = "#34c08a";
const FAIL_ACCENT = "#e0605b";

export function QuizResultsList({ results }: { results: StudentQuizResultWithReview[] }) {
  if (results.length === 0) {
    return (
      <div className="border-gold/20 from-bg-surface to-ink rounded-2xl border bg-linear-to-b px-6 py-12 text-center">
        <p className="text-3xl" aria-hidden="true">
          📝
        </p>
        <p className="font-display text-foreground mt-2 text-lg">No quiz attempts yet</p>
        <p className="text-text-secondary mt-1 text-sm">
          Mark a chapter complete and its quiz will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid max-w-6xl grid-cols-1 items-start gap-x-4 gap-y-5 pb-4 lg:grid-cols-2">
      {results.map((r, index) => (
        <ResultCard key={r.mastery.id} result={r} index={index} />
      ))}
    </div>
  );
}

function ResultCard({ result, index }: { result: StudentQuizResultWithReview; index: number }) {
  const { mastery, latestAttempt, review } = result;
  const [expanded, setExpanded] = useState(false);
  const passed = mastery.status === "MASTERED";
  const percent = latestAttempt
    ? Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)
    : null;
  const canExpand = !passed && review && review.length > 0;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = percent !== null ? circumference - (percent / 100) * circumference : circumference;

  return (
    <div
      className="subject-card subject-card--row"
      style={
        {
          "--card-accent": passed ? PASS_ACCENT : FAIL_ACCENT,
          "--float-delay": `${-(index % 5) * 1.1}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner p-3.5 sm:p-4">
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                {percent !== null ? (
                  <>
                    <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        strokeWidth="4"
                        className="stroke-white/8"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={passed ? "stroke-state-success" : "stroke-state-warning"}
                      />
                    </svg>
                    <span className="text-foreground absolute font-mono text-xs font-bold tabular-nums">
                      {percent}%
                    </span>
                  </>
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                    {passed ? (
                      <CheckCircle2 className="text-state-success h-6 w-6" />
                    ) : (
                      <AlertCircle className="text-state-warning h-6 w-6" />
                    )}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
                  {mastery.chapter.name}
                </p>
                <p className="text-gold-soft/70 truncate text-xs">
                  {mastery.chapter.paper.subject.name} ·{" "}
                  <span className="capitalize">{mastery.chapter.paper.name}</span>
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    passed
                      ? "border-state-success/30 bg-state-success/10 text-state-success"
                      : "border-state-warning/30 bg-state-warning/10 text-state-warning"
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {passed ? "Mastered" : "Needs review"}
                </span>
              </div>
            </div>

            {!passed && (
              <div className="border-gold/15 relative z-10 mt-3 flex items-center justify-between gap-3 border-t pt-3">
                {canExpand ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className="text-gold-soft/80 hover:text-gold-soft flex items-center gap-1 text-xs font-medium transition-colors"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                    {expanded ? "Hide details" : `What to review (${review?.length ?? 0})`}
                  </button>
                ) : (
                  <span />
                )}
                {!passed && (
                  <Link
                    href={`/chapter/${mastery.chapterId}/quiz`}
                    className="from-gold-soft to-gold text-ink flex shrink-0 items-center gap-1.5 rounded-lg bg-linear-to-b px-3.5 py-2 text-xs font-semibold transition-transform active:scale-[0.98]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retake
                  </Link>
                )}
              </div>
            )}

            {expanded && review && (
              <div className="relative z-10 mt-3 space-y-2">
                {review.map((q) => (
                  <div
                    key={q.id}
                    className="border-state-warning/20 rounded-xl border bg-black/40 p-3"
                  >
                    <p className="text-foreground text-sm font-medium">{q.questionText}</p>
                    {q.topicName && (
                      <span className="border-gold/30 text-gold-soft mt-1.5 inline-block rounded-full border bg-black/40 px-2 py-0.5 text-[10px] font-medium">
                        {q.topicName}
                      </span>
                    )}
                    {q.explanation && (
                      <p className="text-text-secondary mt-1.5 text-xs leading-relaxed">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <span className="subject-card-sheen" />
          </div>
        </div>
      </div>
    </div>
  );
}
