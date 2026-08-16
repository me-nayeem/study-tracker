import { Trophy } from "lucide-react";

export function RankCard({ rank, points }: { rank: number | null; points: number }) {
  const isTopThree = rank !== null && rank <= 3;

  return (
    <div
      className={`animate-card-in relative overflow-hidden rounded-2xl border p-5 ${
        isTopThree
          ? "border-accent-gamify/40 from-accent-gamify/15 via-bg-surface to-bg-surface bg-gradient-to-br"
          : "border-bg-elevated bg-bg-surface"
      }`}
    >
      {isTopThree && (
        <div className="bg-accent-gamify/10 pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl" />
      )}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              isTopThree
                ? "bg-accent-gamify/20 text-accent-gamify"
                : "bg-bg-elevated text-text-secondary"
            }`}
          >
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <p className="text-text-secondary text-xs tracking-wide uppercase">Your rank</p>
            <p className="font-display text-foreground text-3xl leading-none">
              {rank ? `#${rank}` : "—"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-xs tracking-wide uppercase">Points</p>
          <p className="text-accent-gamify font-mono text-3xl leading-none font-bold">{points}</p>
        </div>
      </div>
    </div>
  );
}
