import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/leaderboard-data";

export function LeaderboardTable({
  entries,
  page,
  totalPages,
  pageSize,
  trackStudentCount,
  currentStudentId,
  buildHref,
}: {
  entries: LeaderboardEntry[];
  page: number;
  totalPages: number;
  pageSize: number;
  trackStudentCount: number;
  currentStudentId: string;
  buildHref: (o: { page?: number }) => string;
}) {
  const rangeStart = entries.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = entries.length ? rangeStart + entries.length - 1 : 0;

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-xs">
        Showing {rangeStart}–{rangeEnd} of up to 100 · {trackStudentCount} student(s) in your track
      </p>

      <div className="border-bg-elevated bg-bg-surface overflow-hidden rounded-xl border">
        {entries.length === 0 ? (
          <p className="text-text-secondary p-6 text-center text-sm">
            No points earned in this period yet.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.studentId}
              className={
                entry.studentId === currentStudentId
                  ? "bg-accent-primary/10 border-bg-elevated flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                  : "border-bg-elevated flex items-center justify-between border-b px-4 py-3 last:border-b-0"
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-text-secondary w-8 font-mono text-sm">#{entry.rank}</span>
                <span className="text-foreground text-sm">
                  {entry.name}
                  {entry.studentId === currentStudentId ? " (You)" : ""}
                </span>
              </div>
              <span className="text-accent-gamify font-mono text-sm">{entry.points}</span>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: p })}
              className={
                p === page
                  ? "bg-accent-primary text-background rounded-md px-3 py-1.5 text-xs font-medium"
                  : "border-bg-elevated text-text-secondary hover:text-foreground rounded-md border px-3 py-1.5 text-xs"
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
