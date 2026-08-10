import "server-only";
import { prisma } from "@/lib/prisma";
import type { EducationLevel, GroupType } from "@/generated/prisma/enums";

export type TrackMatchResult = { found: true; trackId: string } | { found: false };

export async function matchTrackForLevelGroup(
  level: EducationLevel,
  group: GroupType
): Promise<TrackMatchResult> {
  const candidates = await prisma.track.findMany({
    where: { level, group, isArchived: false },
    select: { id: true, examDate: true, batchYear: true },
  });

  if (candidates.length === 0) {
    return { found: false };
  }

  const now = new Date();

  const withFutureExam = candidates
    .filter((t) => t.examDate !== null && t.examDate >= now)
    .sort((a, b) => {
      const examDiff = a.examDate!.getTime() - b.examDate!.getTime();
      if (examDiff !== 0) return examDiff;
      return b.batchYear - a.batchYear;
    });

  if (withFutureExam.length > 0) {
    return { found: true, trackId: withFutureExam[0].id };
  }

  const byBatchYear = [...candidates].sort((a, b) => b.batchYear - a.batchYear);

  return { found: true, trackId: byBatchYear[0].id };
}
