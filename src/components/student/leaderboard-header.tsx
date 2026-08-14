import Link from "next/link";

export function LeaderboardHeader({
  metric,
  buildHref,
}: {
  metric: "MASTER_SCORE" | "STUDY_TIME";
  buildHref: (o: { metric?: string; period?: string; page?: number }) => string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-display text-foreground text-2xl">Leaderboard</h1>
        <p className="text-text-secondary mt-1 text-sm">See how you stack up in your track.</p>
      </div>
      <div className="flex gap-2">
        <Link
          href={buildHref({ metric: "MASTER_SCORE", period: "ALL_TIME", page: 1 })}
          className={
            metric === "MASTER_SCORE"
              ? "bg-bg-elevated text-foreground rounded-lg px-3 py-1.5 text-sm font-medium"
              : "text-text-secondary hover:text-foreground rounded-lg px-3 py-1.5 text-sm"
          }
        >
          Master score
        </Link>
        <Link
          href={buildHref({ metric: "STUDY_TIME", period: "ALL_TIME", page: 1 })}
          className={
            metric === "STUDY_TIME"
              ? "bg-bg-elevated text-foreground rounded-lg px-3 py-1.5 text-sm font-medium"
              : "text-text-secondary hover:text-foreground rounded-lg px-3 py-1.5 text-sm"
          }
        >
          Study time
        </Link>
      </div>
    </div>
  );
}
