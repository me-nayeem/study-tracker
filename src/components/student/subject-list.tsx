import Link from "next/link";
import { BookOpen, Atom, Calculator, FlaskConical, Globe, Landmark } from "lucide-react";
import type { StudentDashboardData } from "@/lib/student-data";
import { computeSubjectProgress } from "@/lib/progress";
import { ProgressBar } from "./progress-bar";

const ICONS = [BookOpen, Atom, Calculator, FlaskConical, Globe, Landmark];

const COLOR_SETS = [
  { bg: "bg-accent-blue/15", text: "text-accent-blue", bar: "bg-accent-blue" },
  { bg: "bg-accent-purple/15", text: "text-accent-purple", bar: "bg-accent-purple" },
  { bg: "bg-accent-red/15", text: "text-accent-red", bar: "bg-accent-red" },
  { bg: "bg-accent-teal/15", text: "text-accent-teal", bar: "bg-accent-teal" },
  { bg: "bg-accent-gamify/15", text: "text-accent-gamify", bar: "bg-accent-gamify" },
  { bg: "bg-accent-primary/15", text: "text-accent-primary", bar: "bg-accent-primary" },
];

export function SubjectList({ data }: { data: StudentDashboardData }) {
  const { track, topicProgressByTopicId } = data;

  if (!track || track.subjects.length === 0) {
    return (
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">
          No subjects have been added to your track yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {track.subjects.map((subject, i) => {
        const allChapters = subject.papers.flatMap((paper) => paper.chapters);
        const subjectPercent = computeSubjectProgress(allChapters, topicProgressByTopicId);
        const Icon = ICONS[i % ICONS.length];
        const colors = COLOR_SETS[i % COLOR_SETS.length];

        return (
          <div
            key={subject.id}
            className="bg-bg-surface border-bg-elevated animate-card-in rounded-xl border p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-foreground truncate text-lg">{subject.name}</h2>
                  <span className="text-text-secondary shrink-0 font-mono text-xs">
                    {subjectPercent}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar percent={subjectPercent} />
                </div>
              </div>
            </div>

            {subject.papers.length === 0 ? (
              <p className="text-text-secondary mt-4 text-sm">No papers added yet.</p>
            ) : (
              <div className="mt-4 flex gap-2">
                {subject.papers.map((paper) => (
                  <Link
                    key={paper.id}
                    href={`/paper/${paper.id}`}
                    className="bg-accent-primary text-background flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-opacity hover:opacity-90"
                  >
                    {paper.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
