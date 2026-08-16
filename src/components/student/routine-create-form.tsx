"use client";

import { useActionState } from "react";
import { createStudyRoutine } from "@/actions/study-routine";

export function RoutineCreateForm() {
  const [state, formAction, pending] = useActionState(createStudyRoutine, { success: false });

  return (
    <form
      action={formAction}
      className="border-bg-elevated bg-bg-surface flex flex-wrap items-start gap-3 rounded-xl border p-4"
    >
      <input
        name="title"
        placeholder="e.g. Exam week routine"
        className="border-bg-elevated bg-bg-elevated text-foreground min-w-[200px] flex-1 rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-accent-primary text-background rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Creating..." : "New routine"}
      </button>
      {state.fieldErrors?.title && (
        <p className="text-state-warning w-full text-xs">{state.fieldErrors.title[0]}</p>
      )}
    </form>
  );
}
