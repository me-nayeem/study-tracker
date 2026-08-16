import type { Prisma } from "@/generated/prisma/client";
import { awardPoints } from "@/lib/points";
import { getDailyKey } from "@/lib/period-key";

export type StreakResult = {
  awarded: boolean; // true on the first qualifying visit of the day
  streakCount: number;
  pointsAwarded: number;
};

/**
 * Evaluates streak continuity on visit — called once per Dhaka-calendar
 * day, from the dashboard page. Idempotent per day via
 * StudentProfile.lastActiveAt: a 2nd/3rd visit the same day is a silent
 * no-op (awarded: false).
 *
 * "Visiting" is now the entire streak mechanism — not tied to StudySession
 * completion, since the study timer feature is currently unlaunched.
 */
export async function evaluateStreak(
  tx: Prisma.TransactionClient,
  studentId: string,
  now: Date
): Promise<StreakResult> {
  const profile = await tx.studentProfile.findUniqueOrThrow({ where: { id: studentId } });

  const todayKey = getDailyKey(now);
  const lastActiveKey = profile.lastActiveAt ? getDailyKey(profile.lastActiveAt) : null;

  if (lastActiveKey === todayKey) {
    return { awarded: false, streakCount: profile.streakCount, pointsAwarded: 0 };
  }

  const yesterdayKey = getDailyKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const continuing = lastActiveKey === yesterdayKey;
  const newStreakCount = continuing ? profile.streakCount + 1 : 1;

  await tx.studentProfile.update({
    where: { id: studentId },
    data: { streakCount: newStreakCount, lastActiveAt: now },
  });

  const pointsAwarded = await awardPoints(tx, {
    studentId,
    reason: "STREAK_BONUS",
    referenceId: todayKey,
  });

  return { awarded: true, streakCount: newStreakCount, pointsAwarded };
}
