import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getMasterLeaderboardPage, getStudentMasterRank } from "@/lib/leaderboard-data";
import { getDailyKey, getWeeklyKey, getMonthlyKey, ALL_TIME_KEY } from "@/lib/period-key";
import { LeaderboardHeader } from "@/components/student/leaderboard-header";
import { RankCard } from "@/components/student/rank-card";
import { LeaderboardTable } from "@/components/student/leaderboard-table";
import type { LeaderboardPeriod } from "@/generated/prisma/enums";
import { ComingSoonPanel } from "@/components/student/coming-soon";
import { getSubscribedFeatureKeys } from "@/lib/feature-subscriptions";

const PERIOD_TABS: { period: LeaderboardPeriod; label: string }[] = [
  { period: "DAILY", label: "Today" },
  { period: "WEEKLY", label: "Week" },
  { period: "MONTHLY", label: "Month" },
  { period: "ALL_TIME", label: "All-time" },
];

function periodKeyFor(period: LeaderboardPeriod, now: Date): string {
  switch (period) {
    case "DAILY":
      return getDailyKey(now);
    case "WEEKLY":
      return getWeeklyKey(now);
    case "MONTHLY":
      return getMonthlyKey(now);
    case "ALL_TIME":
      return ALL_TIME_KEY;
  }
}

function isValidPeriod(value: string | undefined): value is LeaderboardPeriod {
  return PERIOD_TABS.some((t) => t.period === value);
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ metric?: string; period?: string; page?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  const metric = params.metric === "STUDY_TIME" ? "STUDY_TIME" : "MASTER_SCORE";
  const period = isValidPeriod(params.period) ? params.period : "ALL_TIME";
  const page = Math.max(1, Number(params.page) || 1);
  const periodKey = periodKeyFor(period, new Date());

  function buildHref(overrides: { metric?: string; period?: string; page?: number }) {
    const sp = new URLSearchParams({
      metric: overrides.metric ?? metric,
      period: overrides.period ?? period,
      page: String(overrides.page ?? 1),
    });
    return `/leaderboard?${sp.toString()}`;
  }

  if (metric === "STUDY_TIME") {
    return (
      <div className="space-y-6">
        <LeaderboardHeader metric={metric} buildHref={buildHref} />
        <ComingSoonPanel
          title="Coming soon"
          message="The study-time leaderboard unlocks once the study timer ships."
          featureKey="leaderboard:study-time"
          subscribed={(await getSubscribedFeatureKeys(user.id)).includes("leaderboard:study-time")}
        />
      </div>
    );
  }

  const [{ entries, totalPages, pageSize, trackStudentCount }, myRank] = await Promise.all([
    getMasterLeaderboardPage({ trackId: profile.trackId, period, periodKey, page }),
    getStudentMasterRank({ studentId: profile.id, trackId: profile.trackId, period, periodKey }),
  ]);

  return (
    <div className="space-y-6">
      <LeaderboardHeader metric={metric} buildHref={buildHref} />
      <RankCard rank={myRank.rank} points={myRank.points} />

      <nav
        aria-label="Leaderboard period"
        className="border-gold/20 grid max-w-xl grid-cols-4 gap-1 rounded-xl border bg-black/40 p-1"
      >
        {PERIOD_TABS.map((tab) => {
          const active = tab.period === period;
          return (
            <Link
              key={tab.period}
              href={buildHref({ period: tab.period, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={`rounded-lg px-1 py-2 text-center text-[11px] whitespace-nowrap transition-colors sm:text-xs ${
                active
                  ? "from-gold-soft to-gold text-ink bg-linear-to-b font-semibold"
                  : "text-text-secondary hover:text-foreground font-medium"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <LeaderboardTable
        entries={entries}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        trackStudentCount={trackStudentCount}
        currentStudentId={profile.id}
        buildHref={buildHref}
      />
    </div>
  );
}
