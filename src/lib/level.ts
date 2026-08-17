import type { Prisma } from "@/generated/prisma/client";

export type LevelUpDisplayResult = {
  shouldShow: boolean;
  level: number | null;
  title: string | null;
};

export async function evaluateLevelUpForDisplay(
  tx: Prisma.TransactionClient,
  studentId: string
): Promise<LevelUpDisplayResult> {
  const profile = await tx.studentProfile.findUniqueOrThrow({
    where: { id: studentId },
    select: { level: true, lastShownLevel: true },
  });

  if (profile.level <= profile.lastShownLevel) {
    return { shouldShow: false, level: null, title: null };
  }

  const threshold = await tx.levelThreshold.findUnique({
    where: { level: profile.level },
    select: { title: true },
  });

  await tx.studentProfile.update({
    where: { id: studentId },
    data: { lastShownLevel: profile.level },
  });

  return { shouldShow: true, level: profile.level, title: threshold?.title ?? null };
}