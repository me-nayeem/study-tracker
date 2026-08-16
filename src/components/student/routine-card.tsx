"use client";

import { useActionState, useState } from "react";
import {
  setStudyRoutineActive,
  deleteStudyRoutine,
  deleteStudyRoutineItem,
} from "@/actions/study-routine";
import { RoutineItemForm } from "./routine-item-form";
import { minutesToDisplay } from "@/lib/time-format";
import type { StudyRoutineWithItems } from "@/lib/study-routine-data";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function RoutineCard({
  routine,
  subjects,
}: {
  routine: StudyRoutineWithItems;
  subjects: { id: string; name: string }[];
}) {
  const [activeState, activeAction] = useActionState(setStudyRoutineActive, { success: false });
  const [deleteState, deleteAction] = useActionState(deleteStudyRoutine, { success: false });
  const [addingItem, setAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const itemsByDay = DAY_LABELS.map((label, dayIndex) => ({
    label,
    items: routine.items.filter((item) => item.dayOfWeek === dayIndex),
  }));

  return (
    <div className="border-bg-elevated bg-bg-surface space-y-4 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-foreground text-lg">{routine.title}</h3>
          <span
            className={
              routine.isActive
                ? "bg-state-success/10 text-state-success rounded-full px-2 py-0.5 text-xs font-medium"
                : "bg-text-secondary/10 text-text-secondary rounded-full px-2 py-0.5 text-xs font-medium"
            }
          >
            {routine.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <form action={activeAction}>
            <input type="hidden" name="id" value={routine.id} />
            <input type="hidden" name="isActive" value={routine.isActive ? "false" : "true"} />
            <button type="submit" className="text-accent-primary text-xs hover:underline">
              {routine.isActive ? "Deactivate" : "Activate"}
            </button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={routine.id} />
            <button type="submit" className="text-state-warning text-xs hover:underline">
              Delete
            </button>
          </form>
        </div>
      </div>

      {activeState.error && <p className="text-state-warning text-xs">{activeState.error}</p>}
      {deleteState.error && <p className="text-state-warning text-xs">{deleteState.error}</p>}

      <div className="space-y-3">
        {itemsByDay.map(({ label, items }) => (
          <div key={label}>
            <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
              {label}
            </p>
            <div className="mt-1 space-y-1">
              {items.map((item) =>
                editingItemId === item.id ? (
                  <RoutineItemForm
                    key={item.id}
                    routineId={routine.id}
                    subjects={subjects}
                    item={item}
                    onDone={() => setEditingItemId(null)}
                  />
                ) : (
                  <div
                    key={item.id}
                    className="border-bg-elevated flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {minutesToDisplay(item.startMinute)}–{minutesToDisplay(item.endMinute)}
                      {item.subject ? ` · ${item.subject.name}` : ""}
                      {item.label ? ` · ${item.label}` : ""}
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingItemId(item.id)}
                        className="text-accent-primary text-xs hover:underline"
                      >
                        Edit
                      </button>
                      <DeleteItemButton itemId={item.id} />
                    </div>
                  </div>
                )
              )}
              {items.length === 0 && (
                <p className="text-text-secondary text-xs italic">No blocks scheduled.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {addingItem ? (
        <RoutineItemForm
          routineId={routine.id}
          subjects={subjects}
          onDone={() => setAddingItem(false)}
        />
      ) : (
        <button
          onClick={() => setAddingItem(true)}
          className="text-accent-primary text-xs hover:underline"
        >
          + Add time block
        </button>
      )}
    </div>
  );
}

function DeleteItemButton({ itemId }: { itemId: string }) {
  const [state, action] = useActionState(deleteStudyRoutineItem, { success: false });
  return (
    <form action={action}>
      <input type="hidden" name="id" value={itemId} />
      <button type="submit" className="text-state-warning text-xs hover:underline">
        Delete
      </button>
      {state.error && <p className="text-state-warning text-xs">{state.error}</p>}
    </form>
  );
}
