"use client";

import Link from "next/link";
import {
  FlaskConical,
  Calculator,
  Atom,
  Globe,
  BookOpen,
  Landmark,
  Dna,
  ArrowRight,
} from "lucide-react";
import type { MasteryStatus } from "@/generated/prisma/enums";
import { MasteryBadge } from "./mastery-badge";

const KEYWORD_ICONS: { keywords: string[]; icon: typeof FlaskConical }[] = [
  { keywords: ["organic", "chemistry", "acid", "reaction"], icon: FlaskConical },
  { keywords: ["algebra", "trigonometry", "calculus", "geometry", "math"], icon: Calculator },
  { keywords: ["physics", "motion", "force", "energy", "wave"], icon: Atom },
  { keywords: ["biology", "cell", "genetics", "organism"], icon: Dna },
  { keywords: ["history", "civilization", "war"], icon: Landmark },
  { keywords: ["geography", "climate", "world"], icon: Globe },
];

function renderChapterIcon(name: string, className: string) {
  const lower = name.toLowerCase();
  for (const entry of KEYWORD_ICONS) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      const IconComponent = entry.icon;
      return <IconComponent className={className} />;
    }
  }
  return <BookOpen className={className} />;
}

const CARD_COLORS = [
  { bg: "bg-accent-blue/15", text: "text-accent-blue", ring: "stroke-accent-blue" },
  { bg: "bg-accent-purple/15", text: "text-accent-purple", ring: "stroke-accent-purple" },
  { bg: "bg-accent-red/15", text: "text-accent-red", ring: "stroke-accent-red" },
  { bg: "bg-accent-teal/15", text: "text-accent-teal", ring: "stroke-accent-teal" },
  { bg: "bg-accent-gamify/15", text: "text-accent-gamify", ring: "stroke-accent-gamify" },
  { bg: "bg-accent-primary/15", text: "text-accent-primary", ring: "stroke-accent-primary" },
];

export function ChapterCard({
  chapter,
  percent,
  status,
  index,
}: {
  chapter: { id: string; name: string };
  percent: number;
  status: MasteryStatus;
  index: number;
}) {
  const colors = CARD_COLORS[index % CARD_COLORS.length];
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <Link
      href={`/chapter/${chapter.id}`}
      className="bg-bg-surface border-bg-elevated hover:border-accent-primary/40 animate-card-in group block rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
        >
          {renderChapterIcon(chapter.name, "h-5 w-5")}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-foreground group-hover:text-accent-primary truncate text-sm font-medium transition-colors">
            {chapter.name}
          </p>
          <div className="mt-1">
            <MasteryBadge status={status} />
          </div>
        </div>

        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              strokeWidth="3"
              className="stroke-bg-elevated"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`transition-all duration-500 ${colors.ring}`}
            />
          </svg>
          <span className="text-foreground absolute font-mono text-[10px] font-medium">
            {clamped}%
          </span>
        </div>
      </div>

      {/* <div className="mt-3 flex justify-end">
        <span
          className={`${colors.bg} ${colors.text} flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity group-hover:opacity-80`}
        >
          Read <ArrowRight className="h-3 w-3" />
        </span>
      </div> */}
    </Link>
  );
}
