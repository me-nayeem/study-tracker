import "server-only";
import { prisma } from "@/lib/prisma";

export async function getUnreadChapterReviewNotices(userId: string) {
  return prisma.notification.findMany({
    where: { userId, type: "CHAPTER_NEEDS_REVIEW", isRead: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, body: true, createdAt: true },
  });
}

export type ChapterReviewNotice = Awaited<ReturnType<typeof getUnreadChapterReviewNotices>>[number];