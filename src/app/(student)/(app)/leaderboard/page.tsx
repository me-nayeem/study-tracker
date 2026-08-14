import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getMasterLeaderboardPage, getStudentMasterRank } from "@/lib/leaderboard-data";
import { getDailyKey, getWeeklyKey, getMonthlyKey, ALL_TIME_KEY } from "@/lib/period-key";
import { LeaderboardHeader } from "@/components/student/leaderboard-header";
import { RankCard } from "@/components/student/rank-card";
import { LeaderboardTable } from "@/components/student/leaderboard-table";
import type { LeaderboardPeriod } from "@/generated/prisma/enums";

const PERIOD_TABS: { period: LeaderboardPeriod; label: string }[] = [
  { period: "DAILY", label: "Today" },
  { period: "WEEKLY", label: "This week" },
  { period: "MONTHLY", label: "This month" },
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
  if (!profile) return null; // (app) layout already guarantees a profile exists

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
        <div className="border-bg-elevated bg-bg-surface rounded-xl border p-10 text-center">
          <p className="font-display text-foreground text-lg">Coming soon</p>
          <p className="text-text-secondary mt-1 text-sm">
            The study-time leaderboard unlocks once the study timer ships.
          </p>
        </div>
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

      <div className="flex gap-2">
        {PERIOD_TABS.map((tab) => (
          <Link
            key={tab.period}
            href={buildHref({ period: tab.period, page: 1 })}
            className={
              tab.period === period
                ? "bg-accent-primary text-background rounded-full px-3 py-1.5 text-xs font-medium"
                : "border-bg-elevated text-text-secondary hover:text-foreground rounded-full border px-3 py-1.5 text-xs"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

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
