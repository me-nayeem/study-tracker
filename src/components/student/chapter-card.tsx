import Link from "next/link";
import type { MasteryStatus } from "@/generated/prisma/enums";
import { MasteryPill } from "./mastery-badge";

export function ChapterCard({
  chapter,
  percent,
  status,
  index,
  accent,
}: {
  chapter: { id: string; name: string };
  percent: number;
  status: MasteryStatus;
  index: number;
  /** Subject gem colour, so every chapter of a subject glows the same way. */
  accent: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const mastered = status === "MASTERED";

  return (
    <Link
      href={`/chapter/${chapter.id}`}
      className="subject-card subject-card--row block rounded-[1.1rem]"
      style={
        {
          "--card-accent": accent,
          "--float-delay": `${-(index % 5) * 1.1}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
            {/* chapter number coin */}
            <span className="from-gold-soft via-gold to-gold-deep relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br p-[1.5px] shadow-md">
              {/* background and gold text on separate elements: .gold-text replaces the background */}
              <span className="bg-ink flex h-full w-full items-center justify-center rounded-full">
                <span className="gold-text font-display text-base font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>
            </span>

            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-foreground line-clamp-2 text-sm leading-snug font-medium sm:text-base">
                {chapter.name}
              </p>
              <div className="mt-1.5">
                <MasteryPill status={status} size="sm" />
              </div>
            </div>

            {/* progress ring */}
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center">
              <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  strokeWidth="3"
                  className="stroke-white/8"
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
                  className={`transition-all duration-500 ${mastered ? "stroke-state-success" : "stroke-gold"}`}
                />
              </svg>
              <span className="text-foreground absolute font-mono text-[10px] font-semibold tabular-nums">
                {Math.round(clamped)}%
              </span>
            </div>

            <span className="subject-card-sheen" />
          </div>
        </div>
      </div>
    </Link>
  );
}
