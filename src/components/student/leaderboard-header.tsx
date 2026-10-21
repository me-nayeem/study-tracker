import Link from "next/link";
import { headerTileClass } from "@/components/shared/classes";

export function LeaderboardHeader({
  metric,
  buildHref,
}: {
  metric: "MASTER_SCORE" | "STUDY_TIME";
  buildHref: (o: { metric?: string; period?: string; page?: number }) => string;
}) {
  return (
    <section className="card-surface p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={headerTileClass}>
          🏆
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
            Leaderboard
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm">
            See how you stack up in your track.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1 sm:inline-grid">
        <MetricTab
          href={buildHref({ metric: "MASTER_SCORE", period: "ALL_TIME", page: 1 })}
          active={metric === "MASTER_SCORE"}
          label="Master score"
        />
        <MetricTab
          href={buildHref({ metric: "STUDY_TIME", period: "ALL_TIME", page: 1 })}
          active={metric === "STUDY_TIME"}
          label="Study time"
        />
      </div>
    </section>
  );
}

function MetricTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-5 py-2 text-center text-sm whitespace-nowrap transition-colors ${
        active
          ? "bg-bg-elevated text-foreground font-semibold shadow-sm"
          : "text-text-secondary hover:text-foreground font-medium"
      }`}
    >
      {label}
    </Link>
  );
}
