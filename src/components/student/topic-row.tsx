"use client";

import { useState, useTransition } from "react";
import { Check, BookOpen, PlayCircle, PenLine } from "lucide-react";
import { toggleTopicProgress } from "@/actions/topic-progress";
import type { TopicProgressField } from "@/schemas/topic-progress";
import type { TopicProgressFlags } from "@/lib/progress";

const CHECK_CONFIG: Record<TopicProgressField, { label: string; icon: typeof BookOpen }> = {
  readDone: { label: "Read", icon: BookOpen },
  lectureDone: { label: "Watched lecture", icon: PlayCircle },
  solvedDone: { label: "Solved problems", icon: PenLine },
};

const FIELDS = Object.keys(CHECK_CONFIG) as TopicProgressField[];

export function TopicRow({
  topicId,
  name,
  initial,
}: {
  topicId: string;
  name: string;
  initial: TopicProgressFlags;
}) {
  const [flags, setFlags] = useState<TopicProgressFlags>(initial);
  const [isPending, startTransition] = useTransition();

  function handleToggle(field: TopicProgressField) {
    const nextValue = !flags[field];
    const prevFlags = flags;
    setFlags({ ...flags, [field]: nextValue });

    const formData = new FormData();
    formData.set("topicId", topicId);
    formData.set("field", field);
    formData.set("value", String(nextValue));

    startTransition(async () => {
      const result = await toggleTopicProgress({ success: false }, formData);
      if (!result.success) {
        setFlags(prevFlags);
        alert(result.error ?? "Failed to update.");
      }
    });
  }

  const doneCount = FIELDS.filter((f) => flags[f]).length;
  const allDone = doneCount === FIELDS.length;

  return (
    <div
      className={`animate-card-in rounded-xl border p-4 transition-colors ${
        allDone ? "bg-state-success/10 border-state-success/25" : "bg-bg-surface border-bg-elevated"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-medium">{name}</p>
        <span
          className={`font-mono text-xs font-semibold ${
            allDone ? "text-state-success" : "text-text-secondary"
          }`}
        >
          {doneCount}/{FIELDS.length}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {FIELDS.map((field) => {
          const { label, icon: Icon } = CHECK_CONFIG[field];
          const checked = flags[field];
          return (
            <button
              key={field}
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(field)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                checked
                  ? "bg-state-success/15 text-state-success"
                  : "bg-bg-elevated text-text-secondary hover:text-foreground"
              }`}
            >
              {checked ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
