"use client";

import { useState } from "react";
import { PlayCircle, ListChecks, FileText, Sparkles, Lightbulb, FileCheck } from "lucide-react";

const TABS = [
  {
    id: "lectures",
    label: "Lectures",
    icon: PlayCircle,
    bg: "bg-accent-blue/15",
    text: "text-accent-blue",
  },
  { id: "exam", label: "Exam", icon: FileCheck, bg: "bg-accent-red/15", text: "text-accent-red" },
  {
    id: "checklist",
    label: "Checklist",
    icon: ListChecks,
    bg: "bg-state-success/15",
    text: "text-state-success",
  },
  {
    id: "notes",
    label: "Notes",
    icon: FileText,
    bg: "bg-accent-purple/15",
    text: "text-accent-purple",
  },
  {
    id: "special",
    label: "Special",
    icon: Sparkles,
    bg: "bg-accent-teal/15",
    text: "text-accent-teal",
  },
  {
    id: "tips",
    label: "Tips & Tricks",
    icon: Lightbulb,
    bg: "bg-accent-gamify/15",
    text: "text-accent-gamify",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ChapterTabs({
  lectures,
  exam,
  checklist,
  notes,
  special,
  tips,
}: {
  lectures: React.ReactNode;
  exam: React.ReactNode;
  checklist: React.ReactNode;
  notes: React.ReactNode;
  special: React.ReactNode;
  tips: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("lectures");
  const content = { lectures, exam, checklist, notes, special, tips };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
                isActive
                  ? `${tab.bg} border-transparent ${tab.text}`
                  : "bg-bg-surface border-bg-elevated text-text-secondary hover:bg-bg-elevated"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-center leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="animate-card-in mt-5">{content[active]}</div>
    </div>
  );
}
