import type { Prisma } from "@/generated/prisma/client";
import { awardPoints } from "@/lib/points";
import { getDailyKey } from "@/lib/period-key";

export type StreakResult = {
  awarded: boolean;
  streakCount: number;
  pointsAwarded: number;
  leveledUp: boolean;
  newLevel: number | null;
  newLevelTitle: string | null;
};

export async function evaluateStreak(
  tx: Prisma.TransactionClient,
  studentId: string,
  now: Date
): Promise<StreakResult> {
  const profile = await tx.studentProfile.findUniqueOrThrow({ where: { id: studentId } });

  const todayKey = getDailyKey(now);
  const lastActiveKey = profile.lastActiveAt ? getDailyKey(profile.lastActiveAt) : null;

  if (lastActiveKey === todayKey) {
    return {
      awarded: false,
      streakCount: profile.streakCount,
      pointsAwarded: 0,
      leveledUp: false,
      newLevel: null,
      newLevelTitle: null,
    };
  }

  const yesterdayKey = getDailyKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const continuing = lastActiveKey === yesterdayKey;
  const newStreakCount = continuing ? profile.streakCount + 1 : 1;

  await tx.studentProfile.update({
    where: { id: studentId },
    data: { streakCount: newStreakCount, lastActiveAt: now },
  });

  const result = await awardPoints(tx, {
    studentId,
    reason: "STREAK_BONUS",
    referenceId: todayKey,
  });

  return {
    awarded: true,
    streakCount: newStreakCount,
    pointsAwarded: result.points,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    newLevelTitle: result.newLevelTitle,
  };
}
