import type { Prisma } from "@/generated/prisma/client";
import { LeaderboardMetric, LeaderboardPeriod } from "@/generated/prisma/enums";
import { getDailyKey, getWeeklyKey, getMonthlyKey, ALL_TIME_KEY } from "@/lib/period-key";

export async function addStudyTimeSeconds(
  tx: Prisma.TransactionClient,
  studentId: string,
  trackId: string,
  secondsDelta: number,
  now: Date
): Promise<void> {
  if (secondsDelta <= 0) return;

  const periods: { period: LeaderboardPeriod; periodKey: string }[] = [
    { period: LeaderboardPeriod.DAILY, periodKey: getDailyKey(now) },
    { period: LeaderboardPeriod.WEEKLY, periodKey: getWeeklyKey(now) },
    { period: LeaderboardPeriod.MONTHLY, periodKey: getMonthlyKey(now) },
    { period: LeaderboardPeriod.ALL_TIME, periodKey: ALL_TIME_KEY },
  ];

  for (const { period, periodKey } of periods) {
    await tx.leaderboardSnapshot.upsert({
      where: {
        studentId_metric_period_periodKey: {
          studentId,
          metric: LeaderboardMetric.STUDY_TIME,
          period,
          periodKey,
        },
      },
      create: {
        studentId,
        trackId,
        metric: LeaderboardMetric.STUDY_TIME,
        period,
        periodKey,
        value: secondsDelta,
      },
      update: { value: { increment: secondsDelta } },
    });
  }
}
