import "server-only";
import { prisma } from "@/lib/prisma";

export async function getCurriculumTree() {
  return prisma.track.findMany({
    orderBy: [{ batchYear: "desc" }, { name: "asc" }],
    include: {
      subjects: {
        orderBy: { order: "asc" },
        include: {
          papers: {
            orderBy: { order: "asc" },
            include: {
              chapters: {
                orderBy: { order: "asc" },
                include: {
                  topics: { orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getChapterForStaff(chapterId: string) {
  return prisma.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      name: true,
      isArchived: true,
      paper: {
        select: {
          name: true,
          subject: {
            select: {
              name: true,
              track: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export type ChapterForStaff = Awaited<ReturnType<typeof getChapterForStaff>>;

export type CurriculumTree = Awaited<ReturnType<typeof getCurriculumTree>>;
export type TrackWithChildren = CurriculumTree[number];
export type SubjectWithChildren = TrackWithChildren["subjects"][number];
export type PaperWithChildren = SubjectWithChildren["papers"][number];
export type ChapterWithChildren = PaperWithChildren["chapters"][number];
export type TopicNode = ChapterWithChildren["topics"][number];

const CHAPTER_PICKER_LIMIT = 20;

export async function searchChaptersForPicker(query: string) {
  const trimmed = query.trim();

  return prisma.chapter.findMany({
    where: {
      isArchived: false,
      paper: {
        isArchived: false,
        subject: {
          isArchived: false,
          track: { isArchived: false },
        },
      },
      ...(trimmed ? { name: { contains: trimmed, mode: "insensitive" as const } } : {}),
    },
    orderBy: { name: "asc" },
    take: CHAPTER_PICKER_LIMIT,
    select: {
      id: true,
      name: true,
      paper: {
        select: {
          name: true,
          subject: {
            select: {
              name: true,
              track: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function getTopicsForChapter(chapterId: string) {
  return prisma.topic.findMany({
    where: { chapterId, isArchived: false },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
}

export type ChapterPickerResult = Awaited<ReturnType<typeof searchChaptersForPicker>>[number];
