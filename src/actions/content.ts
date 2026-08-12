"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import {
  ChapterPlaylistSchema,
  ChapterPlaylistUpdateSchema,
  ArchiveContentSchema,
} from "@/schemas/content";

import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { PlaylistReviewSchema } from "@/schemas/content";
import { ChapterSpecialVideoSchema, ChapterSpecialVideoUpdateSchema } from "@/schemas/content";
import { OfficialNoteSchema, OfficialNoteUpdateSchema } from "@/schemas/content";

function playlistPath(chapterId: string) {
  return `/manager/playlists/${chapterId}`;
}

export async function createChapterPlaylist(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = ChapterPlaylistSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
    youtubeUrl: formValue(formData, "youtubeUrl"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId, title, youtubeUrl, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const playlist = await tx.chapterPlaylist.create({
        data: { chapterId, title, youtubeUrl, order, addedByUserId: actor.id },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "ChapterPlaylist",
        entityId: playlist.id,
        metadata: { chapterId, title, youtubeUrl },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "playlist");
  }

  revalidatePath(playlistPath(chapterId));
  return { success: true };
}

export async function updateChapterPlaylist(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = ChapterPlaylistUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
    youtubeUrl: formValue(formData, "youtubeUrl"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, chapterId, title, youtubeUrl, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.chapterPlaylist.findUniqueOrThrow({ where: { id } });
      const playlist = await tx.chapterPlaylist.update({
        where: { id },
        data: { title, youtubeUrl, order },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "ChapterPlaylist",
        entityId: playlist.id,
        metadata: { before, after: playlist },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "playlist");
  }

  revalidatePath(playlistPath(chapterId));
  return { success: true };
}

export async function setChapterPlaylistArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const parsed = ArchiveContentSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  let chapterId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const playlist = await tx.chapterPlaylist.update({
        where: { id: parsed.data.id },
        data: { isArchived },
      });
      chapterId = playlist.chapterId;
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "ChapterPlaylist",
        entityId: playlist.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "playlist");
  }

  revalidatePath(playlistPath(chapterId));
  return { success: true };
}

export async function submitPlaylistReview(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = PlaylistReviewSchema.safeParse({
    playlistId: formValue(formData, "playlistId"),
    rating: formValue(formData, "rating"),
    comment: formValue(formData, "comment"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { playlistId, rating, comment } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) {
    return { success: false, error: "No student profile found." };
  }

  const playlist = await prisma.chapterPlaylist.findFirst({
    where: { id: playlistId, isArchived: false },
    select: {
      id: true,
      chapterId: true,
      chapter: {
        select: {
          paper: { select: { subject: { select: { trackId: true } } } },
        },
      },
    },
  });

  if (!playlist || playlist.chapter.paper.subject.trackId !== profile.trackId) {
    return { success: false, error: "Playlist not found." };
  }

  try {
    await prisma.playlistReview.upsert({
      where: { playlistId_studentId: { playlistId, studentId: profile.id } },
      create: { playlistId, studentId: profile.id, rating, comment: comment ?? null },
      update: { rating, comment: comment ?? null },
    });
  } catch (err) {
    return handlePrismaError(err, "review");
  }

  revalidatePath(`/chapter/${playlist.chapterId}`);
  return { success: true };
}

function specialVideoPath(chapterId: string) {
  return `/manager/special-videos/${chapterId}`;
}

export async function createChapterSpecialVideo(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = ChapterSpecialVideoSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
    tag: formValue(formData, "tag"),
    title: formValue(formData, "title"),
    url: formValue(formData, "url"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId, tag, title, url, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const video = await tx.chapterSpecialVideo.create({
        data: { chapterId, tag, title, url, order, addedByUserId: actor.id },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "ChapterSpecialVideo",
        entityId: video.id,
        metadata: { chapterId, tag, title, url },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "video");
  }

  revalidatePath(specialVideoPath(chapterId));
  return { success: true };
}

export async function updateChapterSpecialVideo(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = ChapterSpecialVideoUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    chapterId: formValue(formData, "chapterId"),
    tag: formValue(formData, "tag"),
    title: formValue(formData, "title"),
    url: formValue(formData, "url"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, chapterId, tag, title, url, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.chapterSpecialVideo.findUniqueOrThrow({ where: { id } });
      const video = await tx.chapterSpecialVideo.update({
        where: { id },
        data: { tag, title, url, order },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "ChapterSpecialVideo",
        entityId: video.id,
        metadata: { before, after: video },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "video");
  }

  revalidatePath(specialVideoPath(chapterId));
  return { success: true };
}

export async function setChapterSpecialVideoArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const parsed = ArchiveContentSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  let chapterId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const video = await tx.chapterSpecialVideo.update({
        where: { id: parsed.data.id },
        data: { isArchived },
      });
      chapterId = video.chapterId;
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "ChapterSpecialVideo",
        entityId: video.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "video");
  }

  revalidatePath(specialVideoPath(chapterId));
  return { success: true };
}

function officialNotePath(chapterId: string) {
  return `/manager/official-notes/${chapterId}`;
}

export async function createOfficialNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = OfficialNoteSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
    fileUrl: formValue(formData, "fileUrl"),
    accessType: formValue(formData, "accessType"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId, title, fileUrl, accessType, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const note = await tx.officialNote.create({
        data: { chapterId, title, fileUrl, accessType, order, createdByUserId: actor.id },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "OfficialNote",
        entityId: note.id,
        metadata: { chapterId, title, accessType },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "note");
  }

  revalidatePath(officialNotePath(chapterId));
  return { success: true };
}

export async function updateOfficialNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = OfficialNoteUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
    fileUrl: formValue(formData, "fileUrl"),
    accessType: formValue(formData, "accessType"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, chapterId, title, fileUrl, accessType, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.officialNote.findUniqueOrThrow({ where: { id } });
      const note = await tx.officialNote.update({
        where: { id },
        data: { title, fileUrl, accessType, order },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "OfficialNote",
        entityId: note.id,
        metadata: { before, after: note },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "note");
  }

  revalidatePath(officialNotePath(chapterId));
  return { success: true };
}

export async function setOfficialNoteArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const parsed = ArchiveContentSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  let chapterId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const note = await tx.officialNote.update({
        where: { id: parsed.data.id },
        data: { isArchived },
      });
      chapterId = note.chapterId;
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "OfficialNote",
        entityId: note.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "note");
  }

  revalidatePath(officialNotePath(chapterId));
  return { success: true };
}
