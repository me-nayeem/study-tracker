import { SAMPLE_LEADERBOARD } from "@/lib/marketing-content";

export function GamificationPreview() {
  return (
    <section className="bg-bg-surface border-bg-elevated border-y px-6 py-20 md:px-16">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="bg-accent-gamify/10 text-accent-gamify inline-block rounded-full px-3 py-1 text-xs font-medium">
            Gamification
          </span>
          <h2 className="font-display text-foreground mt-4 text-3xl md:text-4xl">
            Studying alone gets old.
            <br />
            Competing doesn&apos;t.
          </h2>
          <p className="text-text-secondary mt-4 max-w-md text-sm md:text-base">
            Every chapter mastered, note uploaded, and playlist reviewed earns points — weighted by
            how hard the chapter actually is. Two leaderboards track it: study time and overall
            mastery.
          </p>
          <ul className="text-text-secondary mt-6 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="bg-accent-gamify mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              Weighted points — heavier chapters earn more
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-accent-gamify mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              Study-time and master leaderboards, side by side
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-accent-gamify mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              Streaks and levels build as you go
            </li>
          </ul>
        </div>

        <div className="border-bg-elevated bg-background rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-foreground text-lg">Master leaderboard</h3>
            <span className="bg-bg-elevated text-text-secondary rounded-full px-2.5 py-1 text-[10px] font-medium">
              Sample
            </span>
          </div>

          <ul className="mt-5 space-y-1.5">
            {SAMPLE_LEADERBOARD.map((entry) => (
              <li
                key={entry.rank}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
                  entry.name === "You" ? "bg-accent-primary/10" : "bg-bg-elevated"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-5 font-mono text-sm ${
                      entry.rank <= 3 ? "text-accent-gamify" : "text-text-secondary"
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <span
                    className={`text-sm ${
                      entry.name === "You" ? "text-accent-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {entry.name}
                  </span>
                </span>
                <span className="text-text-secondary font-mono text-xs">
                  {entry.points.toLocaleString()} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
