import Link from "next/link";

export function LeaderboardHeader({
  metric,
  buildHref,
}: {
  metric: "MASTER_SCORE" | "STUDY_TIME";
  buildHref: (o: { metric?: string; period?: string; page?: number }) => string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-foreground text-2xl">Leaderboard</h1>
        <p className="text-text-secondary mt-1 text-sm">See how you stack up in your track.</p>
      </div>
      <div className="bg-bg-surface border-bg-elevated inline-flex gap-1 rounded-xl border p-1">
        <Link
          href={buildHref({ metric: "MASTER_SCORE", period: "ALL_TIME", page: 1 })}
          className={
            metric === "MASTER_SCORE"
              ? "bg-accent-primary text-background rounded-lg px-4 py-2 text-sm font-semibold"
              : "text-text-secondary hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium"
          }
        >
          Master score
        </Link>
        <Link
          href={buildHref({ metric: "STUDY_TIME", period: "ALL_TIME", page: 1 })}
          className={
            metric === "STUDY_TIME"
              ? "bg-accent-primary text-background rounded-lg px-4 py-2 text-sm font-semibold"
              : "text-text-secondary hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium"
          }
        >
          Study time
        </Link>
      </div>
    </div>
  );
}
