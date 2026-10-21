import { Trophy } from "lucide-react";

export function RankCard({ rank, points }: { rank: number | null; points: number }) {
  return (
    <div className="subject-card subject-card--row">
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-gold/10 text-gold flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <Trophy className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="text-text-secondary text-xs">Your rank</p>
                <p className="text-foreground text-3xl leading-tight font-semibold tabular-nums">
                  {rank ? `#${rank}` : "—"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-xs">Points</p>
              <p className="text-gold text-3xl leading-tight font-semibold tabular-nums">
                {points.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
