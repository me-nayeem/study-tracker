"use client";

import { useActionState, useState } from "react";
import { submitFeedback } from "@/actions/feedback";

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "SUGGESTION", label: "Suggestion" },
  { value: "BUG", label: "Bug report" },
];

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedback, { success: false });
  const [prevState, setPrevState] = useState(state);
  const justSubmitted = state !== prevState && state.success;
  if (state !== prevState) setPrevState(state);

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
      {justSubmitted && (
        <p className="text-state-success text-xs">Thanks — your feedback has been sent.</p>
      )}

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