"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitQuizAttempt, type SubmitQuizAttemptState } from "@/actions/quiz-attempt";
import { AlertTriangle, Clock, LogOut, Send } from "lucide-react";
import { buttonGoldClass } from "@/components/shared/classes";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Modal } from "@/components/shared/modal";
import { MathText } from "@/components/shared/math-text";
import { useConfirm, useToast } from "@/components/shared/dialog-provider";

type ClientOption = { index: number; text: string };
type ClientQuestion = { id: string; questionText: string; options: ClientOption[] };

const initialState: SubmitQuizAttemptState = { success: false };

type LeaveTarget = { kind: "back" } | { kind: "link"; href: string };

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

  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const [leavePrompt, setLeavePrompt] = useState<LeaveTarget | null>(null);
  const [leaving, setLeaving] = useState<LeaveTarget | null>(null);
  const guardPushedRef = useRef(false);
  const examActive = !state.success && !leaving;

  function submitAnswers() {
    const formData = new FormData();
    formData.set("quizId", quizId);
    formData.set("chapterId", chapterId);
    formData.set("answers", JSON.stringify(answersRef.current));
    startTransition(() => {
      formAction(formData);
    });
  }

  // While the exam is live, intercept leaving: the browser/phone back button, in-app links,
  // and refresh/close (the last one can only get the browser's own native prompt).
  useEffect(() => {
    if (!examActive) return;

    // An extra entry on top of the history stack means "back" lands on this same page,
    // where we can ask first instead of leaving.
    if (!guardPushedRef.current) {
      window.history.pushState(null, "", window.location.href);
      guardPushedRef.current = true;
    }

    function onPopState() {
      window.history.pushState(null, "", window.location.href);
      setLeavePrompt({ kind: "back" });
    }

    function onClickCapture(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      // Capture phase on document runs before React/Next's own Link handler.
      e.preventDefault();
      e.stopPropagation();
      setLeavePrompt({ kind: "link", href: url.pathname + url.search + url.hash });
    }

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [examActive]);

  // "Submit & leave": submit what's answered, then continue to where the student was going.
  async function confirmLeave() {
    const target = leavePrompt;
    if (!target) return;
    setLeavePrompt(null);
    setLeaving(target);

    // Nothing answered yet: just leave — no attempt is recorded and no retake cooldown starts.
    if (Object.keys(answersRef.current).length === 0) {
      goTo(target);
      return;
    }

    const formData = new FormData();
    formData.set("quizId", quizId);
    formData.set("chapterId", chapterId);
    formData.set("answers", JSON.stringify(answersRef.current));
    const result = await submitQuizAttempt({ success: false }, formData);

    if (!result.success) {
      toast(result.error ?? "Couldn't submit your exam. Please try again.");
      setLeaving(null);
      return;
    }
    goTo(target);
  }

  function goTo(target: LeaveTarget) {
    if (target.kind === "back") {
      // skip our guard entry and the quiz page itself
      window.history.go(-2);
    } else {
      router.push(target.href);
    }
  }

  if (leaving) {
    return (
      <div className="card-surface px-6 py-12 text-center">
        <span className="border-t-gold mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/15" />
        <p className="font-display text-foreground mt-4 text-lg">Finishing your exam…</p>
        <p className="text-text-secondary mt-1 text-sm">Submitting your answers, then leaving.</p>
      </div>
    );
  }

  if (state.success && state.result) {
    return <QuizResultView chapterId={chapterId} result={state.result} />;
  }

  const answeredCount = shuffledQuestions.filter((q) => answers[q.id] !== undefined).length;
  const totalCount = shuffledQuestions.length;
  const unansweredCount = totalCount - answeredCount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (answeredCount === 0 || isPending) return;
    if (unansweredCount > 0) {
      const ok = await confirm({
        title: "Submit with unanswered questions?",
        message: `${unansweredCount} question(s) are still unanswered and will count as wrong.`,
        confirmLabel: "Submit anyway",
      });
      if (!ok) return;
    }
    submitAnswers();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <QuizStatusBar
        secondsLeft={secondsLeft}
        answered={answeredCount}
        total={shuffledQuestions.length}
      />

      {shuffledQuestions.map((q, i) => {
        const answered = answers[q.id] !== undefined;
        return (
          <div
            key={q.id}
            role="radiogroup"
            aria-labelledby={`q-${q.id}-label`}
            className="subject-card-face subject-card-face--panel"
          >
            <div className="subject-card-inner p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                    answered ? "bg-gold text-ink" : "bg-bg-elevated text-foreground/70"
                  }`}
                >
                  {i + 1}
                </span>
                <p
                  id={`q-${q.id}-label`}
                  className="text-foreground pt-1 text-sm leading-relaxed font-medium sm:text-base"
                >
                  <MathText text={q.questionText} />
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, optIndex) => {
                  const selected = answers[q.id] === opt.index;
                  return (
                    <label
                      key={opt.index}
                      className={`has-[input:focus-visible]:ring-gold flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors has-[input:focus-visible]:ring-2 ${
                        selected
                          ? "border-gold/70 bg-gold/10 text-foreground"
                          : "text-foreground/90 border-white/8 bg-white/3 hover:bg-white/6"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.index }))}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          selected ? "bg-gold text-ink" : "text-foreground/70 bg-white/6"
                        }`}
                      >
                        {OPTION_LETTERS[optIndex] ?? optIndex + 1}
                      </span>
                      <MathText
                        text={opt.text}
                        className="min-w-0 flex-1 leading-snug break-words"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {state.error && <p className="text-state-warning text-sm">{state.error}</p>}

      <div className="pt-2 pb-4">
        <button
          type="submit"
          disabled={isPending || answeredCount === 0}
          className={`${buttonGoldClass} w-full py-3 text-base sm:w-auto sm:px-10`}
        >
          <Send className="h-4 w-4" />
          {isPending ? "Submitting…" : "Submit quiz"}
        </button>
        {answeredCount === 0 ? (
          <p className="text-text-secondary mt-2 text-xs">
            Answer at least one question to submit.
          </p>
        ) : (
          unansweredCount > 0 && (
            <p className="text-text-secondary mt-2 text-xs">
              {unansweredCount} unanswered · they will count as wrong if you submit now.
            </p>
          )
        )}
      </div>

      <Modal
        open={leavePrompt !== null}
        onClose={() => setLeavePrompt(null)}
        title="Leave the exam?"
      >
        <div className="text-center">
          <span className="bg-state-warning/15 text-state-warning mx-auto flex h-14 w-14 items-center justify-center rounded-full">
            <AlertTriangle className="h-7 w-7" />
          </span>
          {answeredCount === 0 ? (
            <p className="text-foreground mt-3 text-sm leading-relaxed">
              You haven&apos;t answered any questions yet, so nothing will be submitted. You can
              take this quiz again later.
            </p>
          ) : (
            <>
              <p className="text-foreground mt-3 text-sm leading-relaxed">
                If you leave now, your exam will <strong>finish automatically</strong> and be
                submitted with the answers you have given.
              </p>
              <p className="text-text-secondary mt-2 text-xs">
                <span className="text-gold font-semibold tabular-nums">
                  {answeredCount}/{totalCount}
                </span>{" "}
                answered · unanswered questions count as wrong.
              </p>
            </>
          )}
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => setLeavePrompt(null)}
              className={`${buttonGoldClass} w-full`}
            >
              Stay in exam
            </button>
            <button
              type="button"
              onClick={confirmLeave}
              className="border-state-warning/50 text-state-warning hover:bg-state-warning/10 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {answeredCount === 0 ? "Leave exam" : "Submit & leave"}
            </button>
          </div>
        </div>
      </Modal>
    </form>
  );
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Sticks just under the app top bar: time left (if timed) + how many are answered. */
function QuizStatusBar({
  secondsLeft,
  answered,
  total,
}: {
  secondsLeft: number | null;
  answered: number;
  total: number;
}) {
  const low = secondsLeft !== null && secondsLeft <= 60;
  const pct = total ? (answered / total) * 100 : 0;

  return (
    <div
      className={`sticky top-[68px] z-20 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur md:top-[78px] ${
        low ? "border-state-warning/60 bg-state-warning/15" : "bg-bg-surface/90 border-white/8"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-secondary text-xs">
          <span className="text-foreground font-mono font-semibold tabular-nums">{answered}</span>/
          {total} answered
        </span>
        {secondsLeft !== null && (
          <span
            role="timer"
            aria-label="Time left"
            className={`flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums ${
              low ? "text-state-warning" : "text-gold"
            }`}
          >
            <Clock className="h-4 w-4" />
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>
      <ProgressBar percent={pct} className="mt-2 h-1" />
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
  const wrong = questionResults.filter((q) => !q.isCorrect);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="space-y-5">
      <div className="subject-card-face subject-card-face--panel">
        <div className="subject-card-inner flex flex-col items-center px-6 py-8 text-center">
          <span className="text-4xl" aria-hidden="true">
            {passed ? "🎉" : "📚"}
          </span>
          <div className="relative mt-3 flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                strokeWidth="7"
                className="stroke-white/8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={passed ? "stroke-state-success" : "stroke-state-warning"}
              />
            </svg>
            <span
              className={`absolute text-2xl font-semibold tabular-nums ${
                passed ? "text-state-success" : "text-state-warning"
              }`}
            >
              {percent}%
            </span>
          </div>
          <p className="font-display text-foreground mt-3 text-2xl">
            {passed ? "Chapter mastered!" : "Needs review"}
          </p>
          <p className="text-text-secondary mt-1 max-w-sm text-sm">
            {passed
              ? "Great work — this chapter now counts toward your mastery."
              : "You can retake this quiz in 60 minutes. Review the questions below first."}
          </p>
        </div>
      </div>

      {!passed && wrong.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-foreground text-lg">What to review</h2>
          {wrong.map((q) => (
            <div key={q.questionId} className="card-surface p-4">
              <p className="text-foreground text-sm font-medium">
                <MathText text={q.questionText} />
              </p>
              {q.topicName && (
                <span className="text-foreground/75 mt-2 inline-block rounded-full bg-white/6 px-2 py-0.5 text-[11px] font-medium">
                  {q.topicName}
                </span>
              )}
              {q.explanation && (
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  <MathText text={q.explanation} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Link href={`/chapter/${chapterId}`} className={`${buttonGoldClass} w-full sm:w-auto`}>
        Back to chapter
      </Link>
    </div>
  );
}
