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

const CHECKLIST_ACCENT = "#34c08a";

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
      style={
        {
          "--card-accent": CHECKLIST_ACCENT,
          "--float-delay": `${-(index % 5) * 1.1}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner p-3.5 sm:p-4">
            <div className="relative z-10 flex items-center gap-3">
              {/* topic number coin — turns into a green seal when all three checks are done */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br p-[1.5px] shadow-md ${
                  allDone
                    ? "from-state-success to-state-success/60"
                    : "from-gold-soft via-gold to-gold-deep"
                }`}
              >
                <span className="bg-ink flex h-full w-full items-center justify-center rounded-full">
                  {allDone ? (
                    <Check className="text-state-success h-4 w-4" />
                  ) : (
                    <span className="gold-text font-display text-sm font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </span>
              </span>

              <p className="text-foreground min-w-0 flex-1 text-sm leading-snug font-medium sm:text-base">
                {name}
              </p>

              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                  allDone
                    ? "border-state-success/40 bg-state-success/10 text-state-success"
                    : "border-gold/30 text-gold-soft bg-black/40"
                }`}
              >
                {doneCount}/{FIELDS.length}
              </span>
            </div>

            <div className="relative z-10 mt-3 flex flex-wrap gap-2">
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
                        : "border-gold/25 text-text-secondary hover:border-gold/60 hover:text-foreground bg-black/40"
                    }`}
                  >
                    {checked ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                );
              })}
            </div>

            <span className="subject-card-sheen" />
          </div>
        </div>
      </div>
    </div>
  );
}
