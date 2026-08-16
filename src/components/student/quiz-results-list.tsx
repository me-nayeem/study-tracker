"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ChevronDown, RotateCcw } from "lucide-react";
import type { StudentQuizResultWithReview } from "@/lib/quiz-data";

export function QuizResultsList({ results }: { results: StudentQuizResultWithReview[] }) {
  if (results.length === 0) {
    return (
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">No quiz attempts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        <ResultCard key={r.mastery.id} result={r} />
      ))}
    </div>
  );
}

function ResultCard({ result }: { result: StudentQuizResultWithReview }) {
  const { mastery, latestAttempt, review } = result;
  const [expanded, setExpanded] = useState(false);
  const passed = mastery.status === "MASTERED";
  const percent = latestAttempt
    ? Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)
    : null;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = percent !== null ? circumference - (percent / 100) * circumference : circumference;

  return (
    <div
      className={`animate-card-in rounded-xl border p-4 ${
        passed
          ? "bg-state-success/10 border-state-success/25"
          : "bg-state-warning/10 border-state-warning/25"
      }`}
    >
      <div className="flex items-center gap-4">
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
                  className="stroke-bg-elevated"
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
              <span className="text-foreground absolute font-mono text-xs font-bold">
                {percent}%
              </span>
            </>
          ) : (
            <span className="bg-bg-elevated flex h-14 w-14 items-center justify-center rounded-full">
              {passed ? (
                <CheckCircle2 className="text-state-success h-6 w-6" />
              ) : (
                <AlertCircle className="text-state-warning h-6 w-6" />
              )}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">{mastery.chapter.name}</p>
          <p className="text-text-secondary truncate text-xs">
            {mastery.chapter.paper.subject.name} · {mastery.chapter.paper.name}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {passed ? (
              <CheckCircle2 className="text-state-success h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="text-state-warning h-3.5 w-3.5" />
            )}
            <span
              className={`text-xs font-semibold ${passed ? "text-state-success" : "text-state-warning"}`}
            >
              {passed ? "Mastered" : "Needs review"}
            </span>
          </div>
        </div>

        {!passed && (
          <Link
            href={`/chapter/${mastery.chapterId}/quiz`}
            className="bg-state-warning text-background flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retake
          </Link>
        )}
      </div>

      {!passed && review && review.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-text-secondary hover:text-foreground mt-3 flex items-center gap-1 text-xs font-medium"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Hide details" : "View details"}
        </button>
      )}

      {expanded && review && (
        <div className="border-bg-elevated/60 mt-3 space-y-2 border-t pt-3">
          {review.map((q) => (
            <div key={q.id} className="bg-bg-surface rounded-lg p-3">
              <p className="text-foreground text-sm font-medium">{q.questionText}</p>
              {q.topicName && (
                <span className="bg-accent-gamify/10 text-accent-gamify mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                  {q.topicName}
                </span>
              )}
              {q.explanation && <p className="text-text-secondary mt-1 text-xs">{q.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
