import Link from "next/link";
import { PlayCircle, FileCheck } from "lucide-react";

const CARD_COLORS = [
  { bg: "bg-accent-blue/15", border: "border-accent-blue/30" },
  { bg: "bg-accent-purple/15", border: "border-accent-purple/30" },
  { bg: "bg-accent-red/15", border: "border-accent-red/30" },
  { bg: "bg-accent-teal/15", border: "border-accent-teal/30" },
  { bg: "bg-accent-gamify/15", border: "border-accent-gamify/30" },
];

export function TopicExamSection({ topics }: { topics: { id: string; name: string }[] }) {
  if (topics.length === 0) {
    return <p className="text-text-secondary text-sm">No topics added yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {topics.map((topic, i) => {
        const colors = CARD_COLORS[i % CARD_COLORS.length];
        return (
          <div
            key={topic.id}
            className={`animate-card-in rounded-xl border p-4 ${colors.bg} ${colors.border}`}
          >
            <p className="text-foreground text-sm font-semibold">{topic.name}</p>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/topic/${topic.id}/video`}
                className="bg-bg-surface text-foreground hover:bg-bg-elevated flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Video
              </Link>
              <Link
                href={`/topic/${topic.id}/exam`}
                className="bg-bg-surface text-foreground hover:bg-bg-elevated flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              >
                <FileCheck className="h-3.5 w-3.5" />
                Exam
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}