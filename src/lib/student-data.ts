import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { buildTopicProgressMap, type TopicProgressFlags } from "@/lib/progress";
import type { MasteryStatus } from "@/generated/prisma/enums";

export const getStudentProfile = cache(async (userId: string) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
});

async function getDashboardTrackTree(trackId: string) {
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
                include: {
                  topics: {
                    where: { isArchived: false },
                    orderBy: { order: "asc" },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export type StudentDashboardTrack = Awaited<ReturnType<typeof getDashboardTrackTree>>;
export type StudentDashboardSubject = NonNullable<StudentDashboardTrack>["subjects"][number];
export type StudentDashboardPaper = StudentDashboardSubject["papers"][number];
export type StudentDashboardChapter = StudentDashboardPaper["chapters"][number];

export type ChapterMasteryLite = {
  status: MasteryStatus;
  markedCompleteAt: Date | null;
  masteredAt: Date | null;
};

export type StudentDashboardData = {
  track: StudentDashboardTrack;
  topicProgressByTopicId: Map<string, TopicProgressFlags>;
  chapterMasteryByChapterId: Map<string, ChapterMasteryLite>;
};

export async function getStudentDashboardData(
  trackId: string,
  studentId: string
): Promise<StudentDashboardData> {
  const track = await getDashboardTrackTree(trackId);

  if (!track) {
    return {
      track: null,
      topicProgressByTopicId: new Map(),
      chapterMasteryByChapterId: new Map(),
    };
  }

  const chapterIds: string[] = [];
  const topicIds: string[] = [];
  for (const subject of track.subjects) {
    for (const paper of subject.papers) {
      for (const chapter of paper.chapters) {
        chapterIds.push(chapter.id);
        for (const topic of chapter.topics) {
          topicIds.push(topic.id);
        }
      }
    }
  }

  const [topicProgressRows, chapterMasteryRows] = await Promise.all([
    topicIds.length > 0
      ? prisma.topicProgress.findMany({
          where: { studentId, topicId: { in: topicIds } },
          select: { topicId: true, readDone: true, lectureDone: true, solvedDone: true },
        })
      : Promise.resolve([]),
    chapterIds.length > 0
      ? prisma.chapterMastery.findMany({
          where: { studentId, chapterId: { in: chapterIds } },
          select: { chapterId: true, status: true, markedCompleteAt: true, masteredAt: true },
        })
      : Promise.resolve([]),
  ]);

  const chapterMasteryByChapterId = new Map<string, ChapterMasteryLite>();
  for (const row of chapterMasteryRows) {
    chapterMasteryByChapterId.set(row.chapterId, {
      status: row.status,
      markedCompleteAt: row.markedCompleteAt,
      masteredAt: row.masteredAt,
    });
  }

  return {
    track,
    topicProgressByTopicId: buildTopicProgressMap(topicProgressRows),
    chapterMasteryByChapterId,
  };
}

async function getChapterWithOwnership(chapterId: string) {
  return prisma.chapter.findFirst({
    where: { id: chapterId, isArchived: false },
    include: {
      topics: {
        where: { isArchived: false },
        orderBy: { order: "asc" },
      },
      paper: {
        select: {
          id: true,
          name: true,
          subject: {
            select: { id: true, name: true, trackId: true },
          },
        },
      },
    },
  });
}

export type ChapterDetail = NonNullable<Awaited<ReturnType<typeof getChapterWithOwnership>>>;
export type ChapterDetailTopic = ChapterDetail["topics"][number];

export type ChapterDetailData = {
  chapter: ChapterDetail;
  topicProgressByTopicId: Map<string, TopicProgressFlags>;
  chapterMastery: ChapterMasteryLite | null;
};

export async function getChapterDetail(
  chapterId: string,
  studentId: string,
  trackId: string
): Promise<ChapterDetailData | null> {
  const chapter = await getChapterWithOwnership(chapterId);

  if (!chapter || chapter.paper.subject.trackId !== trackId) {
    return null;
  }

  const topicIds = chapter.topics.map((t) => t.id);

  const [topicProgressRows, mastery] = await Promise.all([
    topicIds.length > 0
      ? prisma.topicProgress.findMany({
          where: { studentId, topicId: { in: topicIds } },
          select: { topicId: true, readDone: true, lectureDone: true, solvedDone: true },
        })
      : Promise.resolve([]),
    prisma.chapterMastery.findUnique({
      where: { studentId_chapterId: { studentId, chapterId } },
      select: { status: true, markedCompleteAt: true, masteredAt: true },
    }),
  ]);

  return {
    chapter,
    topicProgressByTopicId: buildTopicProgressMap(topicProgressRows),
    chapterMastery: mastery,
  };
}
