"use client";

import { useState } from "react";
import Link from "next/link";
import type { StudentQuizResultWithReview } from "@/lib/quiz-data";
import { buttonGhostClass } from "@/components/shared/classes";

export function QuizResultsList({ results }: { results: StudentQuizResultWithReview[] }) {
  if (results.length === 0) {
    return <p className="text-text-secondary text-sm">No quiz attempts yet.</p>;
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        <ResultRow key={r.mastery.id} result={r} />
      ))}
    </div>
  );
}

function ResultRow({ result }: { result: StudentQuizResultWithReview }) {
  const { mastery, latestAttempt, review } = result;
  const [expanded, setExpanded] = useState(false);
  const passed = mastery.status === "MASTERED";
  const percent = latestAttempt
    ? Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)
    : null;

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{mastery.chapter.name}</p>
          <p className="text-text-secondary truncate text-xs">
            {mastery.chapter.paper.subject.name} · {mastery.chapter.paper.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {percent !== null && (
            <span className="text-text-secondary font-mono text-xs">{percent}%</span>
          )}
          <span
            className={`text-xs font-medium ${passed ? "text-state-success" : "text-state-warning"}`}
          >
            {passed ? "Mastered" : "Needs review"}
          </span>
          {!passed && review && review.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={buttonGhostClass}
            >
              {expanded ? "Hide" : "View details"}
            </button>
          )}
          {!passed && (
            <Link
              href={`/chapter/${mastery.chapterId}/quiz`}
              className="text-accent-primary text-xs underline-offset-4 hover:underline"
            >
              Retake
            </Link>
          )}
        </div>
      </div>

      {expanded && review && (
        <div className="border-bg-elevated mt-4 space-y-3 border-t pt-4">
          {review.map((q) => (
            <div key={q.id} className="bg-bg-elevated/40 rounded-lg p-3">
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
