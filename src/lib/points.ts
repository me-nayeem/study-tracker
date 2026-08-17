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

export type AwardPointsResult = {
  points: number;
  leveledUp: boolean;
  newLevel: number | null;
  newLevelTitle: string | null;
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
): Promise<AwardPointsResult> {
  const { studentId, reason, referenceId, quantity, useSecondaryValue } = params;

  const rule = await tx.pointRule.findUnique({ where: { reason } });
  if (!rule || !rule.isActive) {
    return { points: 0, leveledUp: false, newLevel: null, newLevelTitle: null };
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

  const before = await tx.studentProfile.findUniqueOrThrow({
    where: { id: studentId },
    select: { level: true, totalPoints: true },
  });

  const updated = await tx.studentProfile.update({
    where: { id: studentId },
    data: { totalPoints: { increment: points } },
    select: { trackId: true, userId: true },
  });

  await upsertMasterScoreSnapshots(tx, studentId, updated.trackId, points, new Date());

  const newTotalPoints = before.totalPoints + points;

  const eligibleLevel = await tx.levelThreshold.findFirst({
    where: { minPoints: { lte: newTotalPoints } },
    orderBy: { level: "desc" },
    select: { level: true, title: true },
  });

  let leveledUp = false;
  let newLevel: number | null = null;
  let newLevelTitle: string | null = null;

  if (eligibleLevel && eligibleLevel.level > before.level) {
    await tx.studentProfile.update({
      where: { id: studentId },
      data: { level: eligibleLevel.level },
    });

    await tx.notification.create({
      data: {
        userId: updated.userId,
        type: "LEVEL_UP",
        title: `Level ${eligibleLevel.level} reached!`,
        body: `You've earned enough points to reach Level ${eligibleLevel.level}. Keep going!`,
      },
    });

    leveledUp = true;
    newLevel = eligibleLevel.level;
    newLevelTitle = eligibleLevel.title;
  }

  return { points, leveledUp, newLevel, newLevelTitle };
}

export async function manualAdjustPoints(
  tx: Prisma.TransactionClient,
  params: { studentId: string; points: number; referenceId?: string }
): Promise<AwardPointsResult> {
  const { studentId, points, referenceId } = params;

  await tx.pointTransaction.create({
    data: {
      studentId,
      points,
      reason: PointReason.MANUAL_ADJUSTMENT,
      referenceId: referenceId ?? null,
    },
  });

  const before = await tx.studentProfile.findUniqueOrThrow({
    where: { id: studentId },
    select: { level: true, totalPoints: true },
  });

  const updated = await tx.studentProfile.update({
    where: { id: studentId },
    data: { totalPoints: { increment: points } },
    select: { trackId: true, userId: true },
  });

  await upsertMasterScoreSnapshots(tx, studentId, updated.trackId, points, new Date());

  const newTotalPoints = before.totalPoints + points;

  const eligibleLevel = await tx.levelThreshold.findFirst({
    where: { minPoints: { lte: newTotalPoints } },
    orderBy: { level: "desc" },
    select: { level: true, title: true },
  });

  let leveledUp = false;
  let newLevel: number | null = null;
  let newLevelTitle: string | null = null;

  if (eligibleLevel && eligibleLevel.level > before.level) {
    await tx.studentProfile.update({
      where: { id: studentId },
      data: { level: eligibleLevel.level },
    });

    await tx.notification.create({
      data: {
        userId: updated.userId,
        type: "LEVEL_UP",
        title: `Level ${eligibleLevel.level} reached!`,
        body: `You've earned enough points to reach Level ${eligibleLevel.level}. Keep going!`,
      },
    });

    leveledUp = true;
    newLevel = eligibleLevel.level;
    newLevelTitle = eligibleLevel.title;
  }

  return { points, leveledUp, newLevel, newLevelTitle };
}
