import Link from "next/link";
import { Crown, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard-data";

const RANK_STYLES: Record<number, { bg: string; text: string; icon: typeof Crown }> = {
  1: { bg: "bg-accent-gamify/15 border-accent-gamify/40", text: "text-accent-gamify", icon: Crown },
  2: { bg: "bg-text-secondary/10 border-text-secondary/30", text: "text-foreground", icon: Medal },
  3: { bg: "bg-state-premium/15 border-state-premium/40", text: "text-state-premium", icon: Medal },
};

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

  const podium = page === 1 ? entries.filter((e) => e.rank <= 3) : [];
  const rest = page === 1 ? entries.filter((e) => e.rank > 3) : entries;

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-xs">
        Showing {rangeStart}–{rangeEnd} of up to 100 · {trackStudentCount} student(s) in your track
      </p>

      {podium.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {podium.map((entry) => {
            const style = RANK_STYLES[entry.rank];
            const Icon = style.icon;
            const isYou = entry.studentId === currentStudentId;
            return (
              <div
                key={entry.studentId}
                className={`animate-card-in relative rounded-xl border p-4 ${style.bg} ${
                  isYou ? "ring-accent-primary ring-2" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-6 w-6 ${style.text}`} />
                  <span className={`font-mono text-xs font-bold ${style.text}`}>#{entry.rank}</span>
                </div>
                <p className="text-foreground mt-2 truncate text-sm font-semibold">
                  {entry.name}
                  {isYou ? " (You)" : ""}
                </p>
                <p className="text-accent-gamify mt-0.5 font-mono text-lg font-bold">
                  {entry.points}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-bg-elevated bg-bg-surface overflow-hidden rounded-xl border">
        {entries.length === 0 ? (
          <p className="text-text-secondary p-6 text-center text-sm">
            No points earned in this period yet.
          </p>
        ) : rest.length === 0 ? null : (
          rest.map((entry) => {
            const isYou = entry.studentId === currentStudentId;
            return (
              <div
                key={entry.studentId}
                className={`border-bg-elevated flex items-center justify-between border-b px-4 py-3 last:border-b-0 ${
                  isYou ? "bg-accent-primary/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 font-mono text-sm ${
                      isYou ? "text-accent-primary font-bold" : "text-text-secondary"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <span
                    className={`text-sm ${isYou ? "text-foreground font-semibold" : "text-foreground"}`}
                  >
                    {entry.name}
                    {isYou ? " (You)" : ""}
                  </span>
                </div>
                <span className="text-accent-gamify font-mono text-sm font-semibold">
                  {entry.points}
                </span>
              </div>
            );
          })
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
