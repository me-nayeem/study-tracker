"use client";

import { useState, useTransition } from "react";
import { toggleTopicProgress } from "@/actions/topic-progress";
import type { TopicProgressField } from "@/schemas/topic-progress";
import type { TopicProgressFlags } from "@/lib/progress";

const CHECK_LABELS: Record<TopicProgressField, string> = {
  readDone: "Read",
  lectureDone: "Watched lecture",
  solvedDone: "Solved problems",
};

const FIELDS = Object.keys(CHECK_LABELS) as TopicProgressField[];

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

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-lg border p-3">
      <p className="text-foreground text-sm font-medium">{name}</p>
      <div className="mt-2 flex flex-wrap gap-4">
        {FIELDS.map((field) => (
          <label key={field} className="text-text-secondary flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={flags[field]}
              disabled={isPending}
              onChange={() => handleToggle(field)}
              className="accent-accent-primary h-4 w-4 rounded"
            />
            {CHECK_LABELS[field]}
          </label>
        ))}
      </div>
    </div>
  );
}