import "server-only";
import { prisma } from "@/lib/prisma";

export async function getStudyRoutines(studentId: string) {
  return prisma.studyRoutine.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
        include: { subject: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function getTrackSubjects(trackId: string) {
  return prisma.subject.findMany({
    where: { trackId, isArchived: false },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
}

export type StudyRoutineWithItems = Awaited<ReturnType<typeof getStudyRoutines>>[number];
export type StudyRoutineItemWithSubject = StudyRoutineWithItems["items"][number];
