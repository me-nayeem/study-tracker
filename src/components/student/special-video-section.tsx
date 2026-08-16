"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Sparkles, Zap, MoreHorizontal } from "lucide-react";
import type { ChapterSpecialVideo } from "@/generated/prisma/client";
import type { SpecialVideoTag } from "@/generated/prisma/enums";
import { YoutubeIcon } from "../shared/icons/youtube-icon";
import Link from "next/link";

const TAG_LABELS: Record<SpecialVideoTag, string> = {
  ONE_SHOT: "One-shot",
  ADMISSION: "Admission",
  MOTIVATION: "Motivation",
  TRICK: "Trick",
  OTHER: "Other",
};

const TAG_ICONS = {
  ONE_SHOT: YoutubeIcon,
  ADMISSION: GraduationCap,
  MOTIVATION: Sparkles,
  TRICK: Zap,
  OTHER: MoreHorizontal,
};

const TAG_COLORS: Record<SpecialVideoTag, { bg: string; text: string; border: string }> = {
  ONE_SHOT: { bg: "bg-accent-blue/15", text: "text-accent-blue", border: "border-accent-blue/25" },
  ADMISSION: {
    bg: "bg-accent-purple/15",
    text: "text-accent-purple",
    border: "border-accent-purple/25",
  },
  MOTIVATION: {
    bg: "bg-accent-gamify/15",
    text: "text-accent-gamify",
    border: "border-accent-gamify/25",
  },
  TRICK: { bg: "bg-accent-red/15", text: "text-accent-red", border: "border-accent-red/25" },
  OTHER: { bg: "bg-accent-teal/15", text: "text-accent-teal", border: "border-accent-teal/25" },
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TagPill label="All" active={activeTag === "ALL"} onClick={() => setActiveTag("ALL")} />
        {availableTags.map((tag) => (
          <TagPill
            key={tag}
            label={TAG_LABELS[tag]}
            active={activeTag === tag}
            colors={TAG_COLORS[tag]}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((video) => {
          const colors = TAG_COLORS[video.tag];
          const Icon = TAG_ICONS[video.tag];
          return (
            <Link
              key={video.id}
              href={`/special/${video.id}`}
              className={`animate-card-in flex items-center gap-3 rounded-xl border p-4 transition-opacity hover:opacity-90 ${colors.bg} ${colors.border}`}
            >
              <span
                className={`bg-bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.text}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">{video.title}</p>
                <p className={`text-xs font-medium ${colors.text}`}>{TAG_LABELS[video.tag]}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TagPill({
  label,
  active,
  colors,
  onClick,
}: {
  label: string;
  active: boolean;
  colors?: { bg: string; text: string; border: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? colors
            ? `${colors.bg} ${colors.text} border ${colors.border}`
            : "bg-accent-primary text-background"
          : "bg-bg-elevated text-text-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
