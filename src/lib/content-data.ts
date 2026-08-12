import "server-only";
import { prisma } from "@/lib/prisma";

export async function getPlaylistsForChapter(chapterId: string) {
  return prisma.chapterPlaylist.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
  });
}

export type PlaylistReviewLite = {
  rating: number;
  comment: string | null;
};

export async function getPlaylistsForChapterStudentView(chapterId: string, studentId: string) {
  const playlists = await prisma.chapterPlaylist.findMany({
    where: { chapterId, isArchived: false },
    orderBy: { order: "asc" },
  });

  const playlistIds = playlists.map((p) => p.id);

  const reviews =
    playlistIds.length > 0
      ? await prisma.playlistReview.findMany({
          where: { studentId, playlistId: { in: playlistIds } },
          select: { playlistId: true, rating: true, comment: true },
        })
      : [];

  const reviewByPlaylistId = new Map<string, PlaylistReviewLite>();
  for (const r of reviews) {
    reviewByPlaylistId.set(r.playlistId, { rating: r.rating, comment: r.comment });
  }

  return { playlists, reviewByPlaylistId };
}

export async function getSpecialVideosForChapter(chapterId: string) {
  return prisma.chapterSpecialVideo.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
  });
}

export type ChapterSpecialVideoRow = Awaited<ReturnType<typeof getSpecialVideosForChapter>>[number];

export async function getSpecialVideosForChapterStudentView(chapterId: string) {
  return prisma.chapterSpecialVideo.findMany({
    where: { chapterId, isArchived: false },
    orderBy: { order: "asc" },
  });
}

export async function getOfficialNotesForChapter(chapterId: string) {
  return prisma.officialNote.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
  });
}

export type OfficialNoteRow = Awaited<ReturnType<typeof getOfficialNotesForChapter>>[number];

export async function getOfficialNotesForChapterStudentView(chapterId: string) {
  return prisma.officialNote.findMany({
    where: { chapterId, isArchived: false },
    orderBy: { order: "asc" },
  });
}

export async function getStudentNotesForChapterOwner(chapterId: string, studentId: string) {
  return prisma.studentNote.findMany({
    where: { chapterId, studentId },
    orderBy: { createdAt: "desc" },
  });
}

export type StudentNoteOwnerRow = Awaited<
  ReturnType<typeof getStudentNotesForChapterOwner>
>[number];

export async function getPublicStudentNotesForChapter(chapterId: string, excludeStudentId: string) {
  return prisma.studentNote.findMany({
    where: {
      chapterId,
      isPublic: true,
      moderationStatus: "APPROVED",
      studentId: { not: excludeStudentId },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      createdAt: true,
      student: { select: { user: { select: { name: true } } } },
    },
  });
}

export type PublicStudentNoteRow = Awaited<
  ReturnType<typeof getPublicStudentNotesForChapter>
>[number];

export type StudentPlaylistsData = Awaited<ReturnType<typeof getPlaylistsForChapterStudentView>>;

export type ChapterPlaylistRow = Awaited<ReturnType<typeof getPlaylistsForChapter>>[number];
