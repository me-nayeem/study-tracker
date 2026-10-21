"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitFeedback } from "@/actions/feedback";
import { buttonGoldClass, buttonOutlineClass } from "@/components/shared/classes";

const CATEGORIES = [
  { value: "GENERAL", label: "General", emoji: "💬", hint: "Anything on your mind" },
  { value: "SUGGESTION", label: "Suggestion", emoji: "💡", hint: "An idea to make it better" },
  { value: "BUG", label: "Bug report", emoji: "🐞", hint: "Something isn't working" },
] as const;

// same limits as CreateFeedbackSchema
const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

export function FeedbackForm() {
  // remounting the form clears it for "Send another"
  const [formKey, setFormKey] = useState(0);
  return <FeedbackFormInner key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function FeedbackFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitFeedback, { success: false });
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("GENERAL");
  const [message, setMessage] = useState("");

  if (state.success) {
    return (
      <div className="card-surface flex flex-col items-center px-6 py-10 text-center">
        <span className="bg-state-success/15 text-state-success flex h-14 w-14 items-center justify-center rounded-full">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <p className="font-display text-foreground mt-4 text-xl">Thanks for your feedback!</p>
        <p className="text-text-secondary mt-1 max-w-sm text-sm">
          It reached the team. We read every message and use it to improve the app.
        </p>
        <button type="button" onClick={onReset} className={`${buttonOutlineClass} mt-6`}>
          Send another
        </button>
      </div>
    );
  }

  const length = message.trim().length;

  return (
    <form action={formAction} className="card-surface space-y-5 p-4 sm:p-6">
      <fieldset>
        <legend className="text-foreground mb-2.5 text-sm font-semibold">What is it about?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const selected = category === c.value;
            return (
              <label
                key={c.value}
                className={`has-[input:focus-visible]:ring-gold flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors has-[input:focus-visible]:ring-2 ${
                  selected
                    ? "border-gold/70 bg-gold/10"
                    : "border-white/8 bg-white/3 hover:bg-white/6"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c.value}
                  checked={selected}
                  onChange={() => setCategory(c.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="card-well flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                >
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="text-foreground block text-sm font-semibold">{c.label}</span>
                  <span className="text-text-secondary block truncate text-xs">{c.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="feedback-message"
          className="text-foreground mb-2 block text-sm font-semibold"
        >
          Your message
        </label>
        <textarea
          id="feedback-message"
          name="message"
          rows={6}
          maxLength={MAX_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            category === "BUG"
              ? "What happened, and on which page? What did you expect instead?"
              : "Tell us what's on your mind…"
          }
          className="text-foreground placeholder:text-text-secondary focus-visible:border-gold/60 w-full resize-y rounded-xl border border-white/8 bg-white/4 px-3.5 py-3 text-sm leading-relaxed outline-none"
        />
        <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="text-state-warning">{state.fieldErrors?.message?.[0]}</span>
          <span
            className={`tabular-nums ${length > 0 && length < MIN_LENGTH ? "text-state-warning" : "text-text-secondary"}`}
          >
            {length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {state.error && <p className="text-state-warning text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || length < MIN_LENGTH}
        className={`${buttonGoldClass} w-full sm:w-auto`}
      >
        <Send className="h-4 w-4" />
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
