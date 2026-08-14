"use client";

import { useActionState, useState } from "react";
import { updatePointRule } from "@/actions/point-rules";
import type { PointRuleListItem } from "@/lib/point-rules-data";

const REASON_LABELS: Record<string, string> = {
  CHAPTER_MASTERED: "Chapter mastered",
  QUIZ_ATTEMPT: "Quiz attempt",
  EXTERNAL_EXAM_RESULT: "External exam result",
  NOTE_UPLOADED: "Note uploaded",
  STREAK_BONUS: "Streak bonus",
  PLAYLIST_REVIEWED: "Playlist reviewed",
};

const MODE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  PER_MARK: "Per mark",
  PER_WEIGHT: "Per weight",
};

export function PointRuleRow({ rule }: { rule: PointRuleListItem }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updatePointRule, { success: false });

  // Reset edit mode when a submission succeeds — done during render (React's
  // documented pattern for "adjust state when something changes"), not in an
  // effect, since setState-in-effect triggers a cascading-render warning.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success && editing) {
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <div className="border-bg-elevated flex items-center justify-between gap-4 border-b px-4 py-3">
        <div>
          <p className="text-foreground text-sm font-medium">
            {REASON_LABELS[rule.reason] ?? rule.reason}
          </p>
          <p className="text-text-secondary text-xs">{MODE_LABELS[rule.scoringMode]}</p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-foreground font-mono text-sm">
            {rule.value}
            {rule.secondaryValue !== null ? ` / ${rule.secondaryValue}` : ""}
          </span>
          <span
            className={
              rule.isActive
                ? "bg-state-success/10 text-state-success rounded-full px-2.5 py-1 text-xs font-medium"
                : "bg-text-secondary/10 text-text-secondary rounded-full px-2.5 py-1 text-xs font-medium"
            }
          >
            {rule.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-accent-primary text-xs hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-bg-elevated bg-bg-elevated/40 flex flex-wrap items-center gap-4 border-b px-4 py-3"
    >
      <input type="hidden" name="id" value={rule.id} />
      <div className="min-w-[160px]">
        <p className="text-foreground text-sm font-medium">
          {REASON_LABELS[rule.reason] ?? rule.reason}
        </p>
        <p className="text-text-secondary text-xs">{MODE_LABELS[rule.scoringMode]}</p>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-secondary">Value</span>
        <input
          name="value"
          type="number"
          step="0.1"
          defaultValue={rule.value}
          className="border-bg-elevated bg-bg-surface text-foreground w-24 rounded-md border px-2 py-1 font-mono text-sm"
        />
      </label>

      {rule.reason === "NOTE_UPLOADED" && (
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-text-secondary">Subsequent note value</span>
          <input
            name="secondaryValue"
            type="number"
            step="0.1"
            defaultValue={rule.secondaryValue ?? 0}
            className="border-bg-elevated bg-bg-surface text-foreground w-24 rounded-md border px-2 py-1 font-mono text-sm"
          />
        </label>
      )}

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          name="isActive"
          value="true"
          defaultChecked={rule.isActive}
          className="accent-accent-primary h-4 w-4"
        />
        <input type="hidden" name="isActive" value="false" />
        <span className="text-text-secondary">Active</span>
      </label>

      {state.error && <p className="text-state-warning w-full text-xs">{state.error}</p>}

      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-text-secondary text-xs hover:underline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-accent-primary text-background rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
