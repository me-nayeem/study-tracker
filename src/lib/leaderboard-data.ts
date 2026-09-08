import "server-only";
import { prisma } from "@/lib/prisma";
import type { LeaderboardPeriod, Board } from "@/generated/prisma/enums";

const PAGE_SIZE = 25;
const MAX_ENTRIES = 100;

export type LeaderboardEntry = {
  rank: number;
  studentId: string;
  name: string;
  points: number;
  image: string | null;
  institutionName: string | null;
  boardLabel: string | null;
};

export function formatBoardLabel(board: Board | null): string | null {
  if (!board) return null;
  const label = board.charAt(0) + board.slice(1).toLowerCase();
  return `${label} Board`;
}

export async function getMasterLeaderboardPage({
  trackId,
  period,
  periodKey,
  page,
}: {
  trackId: string;
  period: LeaderboardPeriod;
  periodKey: string;
  page: number;
}): Promise<{
  entries: LeaderboardEntry[];
  page: number;
  pageSize: number;
  totalPages: number;
  trackStudentCount: number;
}> {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * PAGE_SIZE;

  const [snapshotCount, trackStudentCount] = await Promise.all([
    prisma.leaderboardSnapshot.count({
      where: { trackId, metric: "MASTER_SCORE", period, periodKey },
    }),
    prisma.studentProfile.count({ where: { trackId } }),
  ]);

  const cappedTotal = Math.min(snapshotCount, MAX_ENTRIES);
  const totalPages = Math.max(1, Math.ceil(cappedTotal / PAGE_SIZE));

  if (skip >= cappedTotal) {
    return { entries: [], page: safePage, pageSize: PAGE_SIZE, totalPages, trackStudentCount };
  }

  const take = Math.min(PAGE_SIZE, MAX_ENTRIES - skip);

  const rows = await prisma.leaderboardSnapshot.findMany({
    where: { trackId, metric: "MASTER_SCORE", period, periodKey },
    orderBy: [{ value: "desc" }, { studentId: "asc" }],
    skip,
    take,
    select: {
      studentId: true,
      value: true,
      student: {
        select: {
          institutionName: true,
          board: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  });

  const entries: LeaderboardEntry[] = rows.map((row, i) => ({
    rank: skip + i + 1,
    studentId: row.studentId,
    name: row.student.user.name ?? "Unnamed student",
    points: row.value,
    image: row.student.user.image,
    institutionName: row.student.institutionName,
    boardLabel: formatBoardLabel(row.student.board),
  }));

  return { entries, page: safePage, pageSize: PAGE_SIZE, totalPages, trackStudentCount };
}

export async function getStudentMasterRank({
  studentId,
  trackId,
  period,
  periodKey,
}: {
  studentId: string;
  trackId: string;
  period: LeaderboardPeriod;
  periodKey: string;
}): Promise<{ rank: number | null; points: number }> {
  const mine = await prisma.leaderboardSnapshot.findUnique({
    where: {
      studentId_metric_period_periodKey: {
        studentId,
        metric: "MASTER_SCORE",
        period,
        periodKey,
      },
    },
  });

  if (!mine) {
    return { rank: null, points: 0 };
  }

  const higherCount = await prisma.leaderboardSnapshot.count({
    where: {
      trackId,
      metric: "MASTER_SCORE",
      period,
      periodKey,
      OR: [{ value: { gt: mine.value } }, { value: mine.value, studentId: { lt: studentId } }],
    },
  });

  return { rank: higherCount + 1, points: mine.value };
}