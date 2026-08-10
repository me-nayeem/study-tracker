import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getStudentProfile = cache(async (userId: string) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
});

export async function getStudentDashboardData(trackId: string) {
  return prisma.track.findUnique({
    where: { id: trackId },
    include: {
      subjects: {
        where: { isArchived: false },
        orderBy: { order: "asc" },
        include: {
          papers: {
            where: { isArchived: false },
            orderBy: { order: "asc" },
            include: {
              chapters: {
                where: { isArchived: false },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

export type StudentDashboardTrack = Awaited<ReturnType<typeof getStudentDashboardData>>;
export type StudentDashboardSubject = NonNullable<StudentDashboardTrack>["subjects"][number];
export type StudentDashboardPaper = StudentDashboardSubject["papers"][number];
export type StudentDashboardChapter = StudentDashboardPaper["chapters"][number];
