"use client";

import { useState, useTransition } from "react";
import { Check, BookOpen, PlayCircle, PenLine } from "lucide-react";
import { toggleTopicProgress } from "@/actions/topic-progress";
import { useToast } from "@/components/shared/dialog-provider";
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
  index = 0,
}: {
  topicId: string;
  name: string;
  initial: TopicProgressFlags;
  index?: number;
}) {
  const [flags, setFlags] = useState<TopicProgressFlags>(initial);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

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
        toast(result.error ?? "Failed to update.");
      }
    });
  }

  const doneCount = FIELDS.filter((f) => flags[f]).length;
  const allDone = doneCount === FIELDS.length;

  return (
    <div
      className="subject-card subject-card--row"
      style={{ "--float-delay": `${-(index % 5) * 1.1}s` } as React.CSSProperties}
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              {/* topic number tile: turns into a green check when all three checks are done */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tabular-nums ${
                  allDone
                    ? "bg-state-success/15 text-state-success"
                    : "bg-bg-elevated text-foreground/80"
                }`}
              >
                {allDone ? <Check className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
              </span>

              <p className="text-foreground min-w-0 flex-1 text-sm leading-snug font-medium sm:text-base">
                {name}
              </p>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                  allDone
                    ? "bg-state-success/15 text-state-success"
                    : "text-foreground/70 bg-white/6"
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
                    aria-pressed={checked}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                      checked
                        ? "border-state-success/40 bg-state-success/15 text-state-success"
                        : "text-text-secondary hover:text-foreground border-white/8 bg-white/4 hover:bg-white/8"
                    }`}
                  >
                    {checked ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
