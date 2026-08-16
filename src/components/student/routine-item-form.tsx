"use client";

import { useActionState, useState } from "react";
import { createStudyRoutineItem, updateStudyRoutineItem } from "@/actions/study-routine";
import { minutesToTimeInput } from "@/lib/time-format";
import type { StudyRoutineItemWithSubject } from "@/lib/study-routine-data";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function RoutineItemForm({
  routineId,
  subjects,
  item,
  onDone,
}: {
  routineId: string;
  subjects: { id: string; name: string }[];
  item?: StudyRoutineItemWithSubject;
  onDone: () => void;
}) {
  const action = item ? updateStudyRoutineItem : createStudyRoutineItem;
  const [state, formAction, pending] = useActionState(action, { success: false });

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success) onDone();
  }

  return (
    <form
      action={formAction}
      className="border-bg-elevated bg-bg-elevated/40 flex flex-wrap items-end gap-3 rounded-lg border p-3"
    >
      {item ? (
        <input type="hidden" name="id" value={item.id} />
      ) : (
        <input type="hidden" name="routineId" value={routineId} />
      )}

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-secondary">Day</span>
        <select
          name="dayOfWeek"
          defaultValue={item?.dayOfWeek ?? 0}
          className="border-bg-elevated bg-bg-surface text-foreground rounded-md border px-2 py-1.5 text-sm"
        >
          {DAY_LABELS.map((label, i) => (
            <option key={i} value={i}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-secondary">Start</span>
        <input
          name="startMinute"
          type="time"
          defaultValue={item ? minutesToTimeInput(item.startMinute) : "16:00"}
          className="border-bg-elevated bg-bg-surface text-foreground rounded-md border px-2 py-1.5 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-secondary">End</span>
        <input
          name="endMinute"
          type="time"
          defaultValue={item ? minutesToTimeInput(item.endMinute) : "17:00"}
          className="border-bg-elevated bg-bg-surface text-foreground rounded-md border px-2 py-1.5 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-secondary">Subject (optional)</span>
        <select
          name="subjectId"
          defaultValue={item?.subject?.id ?? ""}
          className="border-bg-elevated bg-bg-surface text-foreground rounded-md border px-2 py-1.5 text-sm"
        >
          <option value="">None</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 text-xs">
        <span className="text-text-secondary">Label (optional)</span>
        <input
          name="label"
          defaultValue={item?.label ?? ""}
          placeholder="e.g. Chapter revision"
          className="border-bg-elevated bg-bg-surface text-foreground w-full rounded-md border px-2 py-1.5 text-sm"
        />
      </label>

      {state.error && <p className="text-state-warning w-full text-xs">{state.error}</p>}

      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onDone}
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
