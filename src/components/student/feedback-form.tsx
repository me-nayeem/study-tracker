"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { submitFeedback } from "@/actions/feedback";

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "SUGGESTION", label: "Suggestion" },
  { value: "BUG", label: "Bug report" },
];

export function FeedbackForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitFeedback, { success: false });

  if (state.success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="animate-card-in border-bg-elevated bg-bg-surface w-full max-w-sm rounded-2xl border p-6 text-center">
          <div className="bg-state-success/10 text-state-success mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
            ✓
          </div>
          <p className="font-display text-foreground mt-4 text-xl">Thanks for the feedback!</p>
          <p className="text-text-secondary mt-2 text-sm">
            We read every message — this really helps us improve.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-accent-primary text-background mt-5 w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-bg-elevated bg-bg-surface space-y-4 rounded-xl border p-5"
    >
      <div>
        <label className="text-text-secondary text-xs">Category</label>
        <select
          name="category"
          defaultValue="GENERAL"
          className="border-bg-elevated bg-bg-elevated text-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-text-secondary text-xs">Message</label>
        <textarea
          name="message"
          rows={5}
          placeholder="Tell us what's on your mind..."
          className="border-bg-elevated bg-bg-elevated text-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
        {state.fieldErrors?.message && (
          <p className="text-state-warning mt-1 text-xs">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      {state.error && <p className="text-state-warning text-xs">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-accent-primary text-background rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send feedback"}
      </button>
    </form>
  );
}
