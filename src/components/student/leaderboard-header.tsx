import Link from "next/link";

export function LeaderboardHeader({
  metric,
  buildHref,
}: {
  metric: "MASTER_SCORE" | "STUDY_TIME";
  buildHref: (o: { metric?: string; period?: string; page?: number }) => string;
}) {
  return (
    <section
      className="border-gold/20 from-bg-surface to-ink relative overflow-hidden rounded-2xl border bg-linear-to-b p-4 sm:p-6"
      style={{ "--card-accent": "#e3a857" } as React.CSSProperties}
    >
      <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-(--card-accent) opacity-20 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <span className="border-gold/30 relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/40">
          <span className="absolute h-8 w-8 rounded-full bg-(--card-accent) opacity-30 blur-md" />
          <span aria-hidden="true" className="relative text-2xl leading-none">
            🏆
          </span>
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

      <div className="border-gold/20 relative mt-5 grid grid-cols-2 gap-1 rounded-xl border bg-black/40 p-1 sm:inline-grid">
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
          ? "from-gold-soft to-gold text-ink bg-linear-to-b font-semibold shadow-[0_6px_18px_-8px_rgba(214,166,72,0.7)]"
          : "text-text-secondary hover:text-foreground font-medium"
      }`}
    >
      {label}
    </Link>
  );
}
