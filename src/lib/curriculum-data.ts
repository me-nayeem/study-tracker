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

export type CurriculumTree = Awaited<ReturnType<typeof getCurriculumTree>>;
export type TrackWithChildren = CurriculumTree[number];
export type SubjectWithChildren = TrackWithChildren["subjects"][number];
export type PaperWithChildren = SubjectWithChildren["papers"][number];
export type ChapterWithChildren = PaperWithChildren["chapters"][number];
export type TopicNode = ChapterWithChildren["topics"][number];
