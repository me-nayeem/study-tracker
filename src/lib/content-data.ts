import "server-only";
import { prisma } from "@/lib/prisma";

export async function getPlaylistsForChapter(chapterId: string) {
  return prisma.chapterPlaylist.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
    include: {
      videos: {
        orderBy: { order: "asc" },
      },
    },
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
    include: {
      reviews: {
        select: {
          studentId: true,
          rating: true,
          comment: true,
          student: { select: { user: { select: { name: true } } } },
        },
      },
      _count: { select: { videos: { where: { isArchived: false } } } },
    },
  });

  return playlists.map((p) => {
    const ownReview = p.reviews.find((r) => r.studentId === studentId);
    const avgRating =
      p.reviews.length > 0 ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length : 0;
    const comments = p.reviews
      .filter((r) => r.comment && r.comment.trim().length > 0)
      .map((r) => ({
        studentName: r.student.user.name ?? "Anonymous",
        comment: r.comment!,
        rating: r.rating,
        isOwn: r.studentId === studentId,
      }));

    return {
      id: p.id,
      title: p.title,
      youtubeUrl: p.youtubeUrl,
      channelUrl: p.channelUrl,
      videoCount: p._count.videos,
      avgRating,
      reviewCount: p.reviews.length,
      ownRating: ownReview?.rating ?? null,
      ownComment: ownReview?.comment ?? null,
      comments,
    };
  });
}

export type StudentPlaylistCard = Awaited<
  ReturnType<typeof getPlaylistsForChapterStudentView>
>[number];

export async function getPlaylistVideosForPlaylist(playlistId: string) {
  return prisma.chapterPlaylistVideo.findMany({
    where: { playlistId },
    orderBy: { order: "asc" },
  });
}

async function getPlaylistWithOwnership(playlistId: string, studentId: string) {
  return prisma.chapterPlaylist.findFirst({
    where: { id: playlistId, isArchived: false },
    include: {
      chapter: {
        select: {
          id: true,
          name: true,
          paper: { select: { subject: { select: { trackId: true } } } },
        },
      },
      videos: {
        where: { isArchived: false },
        orderBy: { order: "asc" },
        include: {
          progress: {
            where: { studentId },
            select: { completed: true },
          },
        },
      },
    },
  });
}

export async function getPlaylistWatchData(
  playlistId: string,
  studentId: string,
  trackId: string
) {
  const playlist = await getPlaylistWithOwnership(playlistId, studentId);
  if (!playlist || playlist.chapter.paper.subject.trackId !== trackId) {
    return null;
  }

  return {
    ...playlist,
    videos: playlist.videos.map(({ progress, ...video }) => ({
      ...video,
      completed: progress[0]?.completed ?? false,
    })),
  };
}

export type PlaylistWatchData = NonNullable<Awaited<ReturnType<typeof getPlaylistWatchData>>>;
export type PlaylistWatchVideo = PlaylistWatchData["videos"][number];

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

export async function getChapterTipsForChapterStudentView(chapterId: string) {
  return prisma.chapterTip.findMany({
    where: { chapterId, isArchived: false },
    orderBy: { order: "asc" },
  });
}

export type ChapterTipRow = Awaited<ReturnType<typeof getChapterTipsForChapterStudentView>>[number];

export async function getChapterTipsForChapter(chapterId: string) {
  return prisma.chapterTip.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
  });
}

export type PublicStudentNoteRow = Awaited<
  ReturnType<typeof getPublicStudentNotesForChapter>
>[number];

export type StudentPlaylistsData = Awaited<ReturnType<typeof getPlaylistsForChapterStudentView>>;

export type ChapterPlaylistRow = Awaited<ReturnType<typeof getPlaylistsForChapter>>[number];

export async function getPublicNotesFeed(
  trackId: string,
  viewerStudentId: string,
  chapterId?: string
) {
  const notes = await prisma.studentNote.findMany({
    where: {
      isPublic: true,
      moderationStatus: "APPROVED",
      chapterId: chapterId ?? undefined,
      chapter: { paper: { subject: { trackId } } },
    },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      createdAt: true,
      chapterId: true,
      chapter: { select: { name: true } },
      student: { select: { id: true, user: { select: { name: true } } } },
      likes: { select: { studentId: true } },
      ratings: { select: { rating: true, studentId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          studentId: true,
          student: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  return notes
    .map((n) => {
      const avgRating =
        n.ratings.length > 0
          ? n.ratings.reduce((sum, r) => sum + r.rating, 0) / n.ratings.length
          : 0;
      return {
        id: n.id,
        title: n.title,
        fileUrl: n.fileUrl,
        chapterId: n.chapterId,
        chapterName: n.chapter.name,
        studentName: n.student.user.name ?? "Anonymous",
        isOwn: n.student.id === viewerStudentId,
        likeCount: n.likes.length,
        ratingCount: n.ratings.length,
        avgRating,
        likedByViewer: n.likes.some((l) => l.studentId === viewerStudentId),
        ownRating: n.ratings.find((r) => r.studentId === viewerStudentId)?.rating ?? null,
        score: n.likes.length + n.ratings.length,
        comments: n.comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdAt: c.createdAt,
          studentName: c.student.user.name ?? "Anonymous",
          isOwn: c.studentId === viewerStudentId,
        })),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export type PublicNoteFeedItem = Awaited<ReturnType<typeof getPublicNotesFeed>>[number];

export async function getTrackFilterOptions(trackId: string) {
  return prisma.subject.findMany({
    where: { trackId, isArchived: false },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      papers: {
        where: { isArchived: false },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          chapters: {
            where: { isArchived: false },
            orderBy: { order: "asc" },
            select: { id: true, name: true },
          },
        },
      },
    },
  });
}

export type TrackFilterOptions = Awaited<ReturnType<typeof getTrackFilterOptions>>;

export async function getPlaylistsIndexForTrack(
  trackId: string,
  filters: { subjectId?: string; paperId?: string; chapterId?: string; q?: string }
) {
  const playlists = await prisma.chapterPlaylist.findMany({
    where: {
      isArchived: false,
      chapterId: filters.chapterId || undefined,
      title: filters.q ? { contains: filters.q, mode: "insensitive" } : undefined,
      chapter: {
        paper: {
          id: filters.paperId || undefined,
          subject: {
            id: filters.subjectId || undefined,
            trackId,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      chapter: {
        select: {
          name: true,
          paper: {
            select: {
              name: true,
              subject: { select: { name: true } },
            },
          },
        },
      },
      reviews: { select: { rating: true } },
      _count: { select: { videos: { where: { isArchived: false } } } },
    },
  });

  return playlists.map((p) => ({
    id: p.id,
    title: p.title,
    subjectName: p.chapter.paper.subject.name,
    paperName: p.chapter.paper.name,
    chapterName: p.chapter.name,
    videoCount: p._count.videos,
    avgRating:
      p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
    reviewCount: p.reviews.length,
  }));
}

export type PlaylistIndexRow = Awaited<ReturnType<typeof getPlaylistsIndexForTrack>>[number];

async function getSpecialVideoWithOwnership(videoId: string) {
  return prisma.chapterSpecialVideo.findFirst({
    where: { id: videoId, isArchived: false },
    include: {
      chapter: {
        select: {
          id: true,
          name: true,
          paper: { select: { subject: { select: { trackId: true } } } },
        },
      },
    },
  });
}

export async function getSpecialVideoWatchData(videoId: string, trackId: string) {
  const video = await getSpecialVideoWithOwnership(videoId);
  if (!video || video.chapter.paper.subject.trackId !== trackId) {
    return null;
  }

  const siblings = await prisma.chapterSpecialVideo.findMany({
    where: { chapterId: video.chapterId, isArchived: false },
    orderBy: { order: "asc" },
  });

  return { activeVideo: video, chapter: video.chapter, videos: siblings };
}

export type SpecialVideoWatchData = NonNullable<
  Awaited<ReturnType<typeof getSpecialVideoWatchData>>
>;