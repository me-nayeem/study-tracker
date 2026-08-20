"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition  } from "react";
import Link from "next/link";
import { submitQuizAttempt, type SubmitQuizAttemptState } from "@/actions/quiz-attempt";
import { buttonPrimaryClass } from "@/components/shared/classes";

type ClientOption = { index: number; text: string };
type ClientQuestion = { id: string; questionText: string; options: ClientOption[] };

const initialState: SubmitQuizAttemptState = { success: false };

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizTakingForm({
  chapterId,
  quizId,
  questions,
  timeLimitMinutes,
}: {
  chapterId: string;
  quizId: string;
  questions: ClientQuestion[];
  timeLimitMinutes: number | null;
}) {
  const shuffledQuestions = useMemo(
    () => shuffle(questions).map((q) => ({ ...q, options: shuffle(q.options) })),
    []
  );

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [state, formAction, isPending] = useActionState(submitQuizAttempt, initialState);
  const [, startTransition] = useTransition();

  const deadlineRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    timeLimitMinutes ? timeLimitMinutes * 60 : null
  );
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (!timeLimitMinutes || state.success) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + timeLimitMinutes * 60_000;
    }

    const interval = setInterval(() => {
      const remainingMs = deadlineRef.current! - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(remainingMs / 1000)));

      if (remainingMs <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        clearInterval(interval);
        const formData = new FormData();
        formData.set("quizId", quizId);
        formData.set("chapterId", chapterId);
        formData.set("answers", JSON.stringify(answersRef.current));
        startTransition(() => {
          formAction(formData);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  if (state.success && state.result) {
    return <QuizResultView chapterId={chapterId} result={state.result} />;
  }

  const allAnswered = shuffledQuestions.every((q) => answers[q.id] !== undefined);

  return (
    <form
      action={(formData) => {
        formData.set("quizId", quizId);
        formData.set("chapterId", chapterId);
        formData.set("answers", JSON.stringify(answers));
        formAction(formData);
      }}
      className="space-y-5"
    >
      {secondsLeft !== null && <QuizTimer secondsLeft={secondsLeft} />}

      {shuffledQuestions.map((q, i) => (
        <div key={q.id} className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
          <p className="text-foreground text-sm font-medium">
            {i + 1}. {q.questionText}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt) => (
              <label key={opt.index} className="text-foreground flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === opt.index}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.index }))}
                  className="accent-accent-primary h-4 w-4"
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {state.error && <p className="text-state-warning text-sm">{state.error}</p>}

      <button type="submit" disabled={isPending || !allAnswered} className={buttonPrimaryClass}>
        {isPending ? "Submitting…" : "Submit quiz"}
      </button>
      {!allAnswered && (
        <p className="text-text-secondary text-xs">Answer every question to submit.</p>
      )}
    </form>
  );
}

function QuizTimer({ secondsLeft }: { secondsLeft: number }) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const low = secondsLeft <= 60;

  return (
    <div
      className={`sticky top-0 z-10 rounded-xl border px-4 py-2 text-center font-mono text-sm ${
        low
          ? "border-state-warning bg-state-warning/10 text-state-warning"
          : "border-bg-elevated bg-bg-surface text-foreground"
      }`}
    >
      Time left: {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

function QuizResultView({
  chapterId,
  result,
}: {
  chapterId: string;
  result: NonNullable<SubmitQuizAttemptState["result"]>;
}) {
  const { percent, passed, questionResults } = result;

  return (
    <div className="space-y-5">
      <div
        className={`rounded-xl border p-6 text-center ${
          passed
            ? "border-state-success bg-state-success/10"
            : "border-state-warning bg-state-warning/10"
        }`}
      >
        <p
          className={`font-mono text-3xl font-medium ${passed ? "text-state-success" : "text-state-warning"}`}
        >
          {percent}%
        </p>
        <p className="text-foreground mt-2 font-medium">
          {passed ? "Chapter mastered" : "Needs review"}
        </p>
        {!passed && (
          <p className="text-text-secondary mt-1 text-sm">
            You can retake this quiz in 60 minutes.
          </p>
        )}
      </div>

      {!passed && (
        <div className="space-y-3">
          <h2 className="font-display text-foreground text-lg">Review</h2>
          {questionResults
            .filter((q) => !q.isCorrect)
            .map((q) => (
              <div
                key={q.questionId}
                className="border-state-warning/40 bg-bg-surface rounded-xl border p-4"
              >
                <p className="text-foreground text-sm font-medium">{q.questionText}</p>
                {q.topicName && (
                  <span className="bg-accent-gamify/10 text-accent-gamify mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                    {q.topicName}
                  </span>
                )}
                {q.explanation && (
                  <p className="text-text-secondary mt-2 text-sm">{q.explanation}</p>
                )}
              </div>
            ))}
        </div>
      )}

      <Link href={`/chapter/${chapterId}`} className={`${buttonPrimaryClass} inline-block`}>
        Back to chapter
      </Link>
    </div>
  );
}