import type { Prisma } from "@/generated/prisma/client";
import {
  PointReason,
  ScoringMode,
  LeaderboardMetric,
  LeaderboardPeriod,
} from "@/generated/prisma/enums";
import { getDailyKey, getWeeklyKey, getMonthlyKey, ALL_TIME_KEY } from "@/lib/period-key";

type AwardPointsParams = {
  studentId: string;
  reason: PointReason;
  referenceId: string;
  quantity?: number;
  useSecondaryValue?: boolean;
};

async function upsertMasterScoreSnapshots(
  tx: Prisma.TransactionClient,
  studentId: string,
  trackId: string,
  points: number,
  now: Date
): Promise<void> {
  if (points === 0) return;

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
          metric: LeaderboardMetric.MASTER_SCORE,
          period,
          periodKey,
        },
      },
      create: {
        studentId,
        trackId,
        metric: LeaderboardMetric.MASTER_SCORE,
        period,
        periodKey,
        value: points,
      },
      update: {
        value: { increment: points },
      },
    });
  }
}

export async function awardPoints(
  tx: Prisma.TransactionClient,
  params: AwardPointsParams
): Promise<number> {
  const { studentId, reason, referenceId, quantity, useSecondaryValue } = params;

  const rule = await tx.pointRule.findUnique({ where: { reason } });
  if (!rule || !rule.isActive) {
    return 0;
  }

  const baseValue = useSecondaryValue ? (rule.secondaryValue ?? rule.value) : rule.value;

  let rawPoints: number;
  switch (rule.scoringMode) {
    case ScoringMode.FLAT:
      rawPoints = baseValue;
      break;
    case ScoringMode.PER_MARK:
    case ScoringMode.PER_WEIGHT:
      if (quantity === undefined) {
        throw new Error(
          `awardPoints: ${reason} uses ${rule.scoringMode} scoring but no quantity was provided.`
        );
      }
      rawPoints = baseValue * quantity;
      break;
    default:
      throw new Error(`awardPoints: unhandled scoringMode ${rule.scoringMode}`);
  }

  const points = Math.round(rawPoints);

  await tx.pointTransaction.create({
    data: { studentId, points, reason, referenceId },
  });

  const updated = await tx.studentProfile.update({
    where: { id: studentId },
    data: { totalPoints: { increment: points } },
    select: { trackId: true },
  });

  await upsertMasterScoreSnapshots(tx, studentId, updated.trackId, points, new Date());

  return points;
}

export async function manualAdjustPoints(
  tx: Prisma.TransactionClient,
  params: { studentId: string; points: number; referenceId?: string }
): Promise<void> {
  const { studentId, points, referenceId } = params;

  await tx.pointTransaction.create({
    data: {
      studentId,
      points,
      reason: PointReason.MANUAL_ADJUSTMENT,
      referenceId: referenceId ?? null,
    },
  });

  const updated = await tx.studentProfile.update({
    where: { id: studentId },
    data: { totalPoints: { increment: points } },
    select: { trackId: true },
  });

  await upsertMasterScoreSnapshots(tx, studentId, updated.trackId, points, new Date());
}
