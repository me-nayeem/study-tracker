import { Trophy } from "lucide-react";

export function RankCard({ rank, points }: { rank: number | null; points: number }) {
  const isTopThree = rank !== null && rank <= 3;

  return (
    <div
      className="subject-card subject-card--row"
      style={{ "--card-accent": isTopThree ? "#e3a857" : "#9d7cff" } as React.CSSProperties}
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="relative z-10 flex min-w-0 items-center gap-3">
              <span className="from-gold-soft via-gold to-gold-deep flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br p-[1.5px] shadow-md">
                <span className="bg-ink text-gold flex h-full w-full items-center justify-center rounded-2xl">
                  <Trophy className="h-7 w-7" />
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-gold-soft/70 text-[10px] font-medium tracking-[0.2em] uppercase">
                  Your rank
                </p>
                <p className="gold-text font-display text-4xl leading-none font-semibold">
                  {rank ? `#${rank}` : "—"}
                </p>
              </div>
            </div>
            <div className="relative z-10 text-right">
              <p className="text-gold-soft/70 text-[10px] font-medium tracking-[0.2em] uppercase">
                Points
              </p>
              <p className="gold-text font-mono text-3xl leading-none font-bold tabular-nums">
                {points.toLocaleString()}
              </p>
            </div>

            <span className="subject-card-sheen" />
          </div>
        </div>
      </div>
    </div>
  );
}
