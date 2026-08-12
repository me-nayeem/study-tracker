"use client";

import { useMemo, useState } from "react";
import type { ChapterSpecialVideo } from "@/generated/prisma/client";
import type { SpecialVideoTag } from "@/generated/prisma/enums";

const TAG_LABELS: Record<SpecialVideoTag, string> = {
  ONE_SHOT: "One-shot",
  ADMISSION: "Admission",
  MOTIVATION: "Motivation",
  TRICK: "Trick",
  OTHER: "Other",
};

export function SpecialVideoSection({ videos }: { videos: ChapterSpecialVideo[] }) {
  const [activeTag, setActiveTag] = useState<SpecialVideoTag | "ALL">("ALL");

  const availableTags = useMemo(() => {
    const set = new Set<SpecialVideoTag>();
    for (const v of videos) set.add(v.tag);
    return Array.from(set);
  }, [videos]);

  const filtered = activeTag === "ALL" ? videos : videos.filter((v) => v.tag === activeTag);

  if (videos.length === 0) {
    return <p className="text-text-secondary text-sm">No special videos for this chapter yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TagPill label="All" active={activeTag === "ALL"} onClick={() => setActiveTag("ALL")} />
        {availableTags.map((tag) => (
          <TagPill
            key={tag}
            label={TAG_LABELS[tag]}
            active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-bg-elevated hover:bg-bg-elevated/70 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
          >
            <span className="text-foreground min-w-0 truncate">{video.title}</span>
            <span className="bg-accent-gamify/10 text-accent-gamify shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">
              {TAG_LABELS[video.tag]}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function TagPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-accent-primary text-foreground"
          : "bg-bg-elevated text-text-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
