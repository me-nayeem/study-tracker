"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { checkGoogleDriveLinkPublic } from "@/lib/drive-link-check";
import {
  CreateStudentNoteSchema,
  UpdateStudentNoteSchema,
  SetStudentNoteVisibilitySchema,
} from "@/schemas/student-notes";
import { awardPoints } from "@/lib/points";

function chapterPath(chapterId: string) {
  return `/chapter/${chapterId}`;
}

const LINK_NOT_PUBLIC_ERROR =
  'This link isn\'t accessible without signing in. Set Drive sharing to "Anyone with the link" and try again.';

export async function createStudentNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = CreateStudentNoteSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
    fileUrl: formValue(formData, "fileUrl"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId, title, fileUrl } = parsed.data;
  const isPublic = formValue(formData, "isPublic") === "true";

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, isArchived: false },
    select: { id: true, paper: { select: { subject: { select: { trackId: true } } } } },
  });

  if (!chapter || chapter.paper.subject.trackId !== profile.trackId) {
    return { success: false, error: "Chapter not found." };
  }

  let moderationStatus: "PENDING" | "APPROVED" = "PENDING";

  if (isPublic) {
    const linkStatus = await checkGoogleDriveLinkPublic(fileUrl);
    if (linkStatus === "PRIVATE") {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: { fileUrl: [LINK_NOT_PUBLIC_ERROR] },
      };
    }
    moderationStatus = "APPROVED";
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingCount = await tx.studentNote.count({
        where: { studentId: profile.id, chapterId },
      });

      const note = await tx.studentNote.create({
        data: { studentId: profile.id, chapterId, title, fileUrl, isPublic, moderationStatus },
      });

      await awardPoints(tx, {
        studentId: profile.id,
        reason: "NOTE_UPLOADED",
        referenceId: note.id,
        useSecondaryValue: existingCount > 0,
      });
    });
  } catch (err) {
    return handlePrismaError(err, "note");
  }

  revalidatePath(chapterPath(chapterId));
  return { success: true };
}

export async function updateStudentNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = UpdateStudentNoteSchema.safeParse({
    id: formValue(formData, "id"),
    title: formValue(formData, "title"),
    fileUrl: formValue(formData, "fileUrl"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, title, fileUrl } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const existing = await prisma.studentNote.findUnique({ where: { id } });
  if (!existing || existing.studentId !== profile.id) {
    return { success: false, error: "Note not found." };
  }

  const linkChanged = fileUrl !== existing.fileUrl;

  if (existing.isPublic && linkChanged) {
    const linkStatus = await checkGoogleDriveLinkPublic(fileUrl);
    if (linkStatus === "PRIVATE") {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: { fileUrl: [LINK_NOT_PUBLIC_ERROR] },
      };
    }
  }

  try {
    await prisma.studentNote.update({ where: { id }, data: { title, fileUrl } });
  } catch (err) {
    return handlePrismaError(err, "note");
  }

  revalidatePath(chapterPath(existing.chapterId));
  return { success: true };
}

export async function setStudentNoteVisibility(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = SetStudentNoteVisibilitySchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;
  const isPublic = formValue(formData, "isPublic") === "true";

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const existing = await prisma.studentNote.findUnique({ where: { id } });
  if (!existing || existing.studentId !== profile.id) {
    return { success: false, error: "Note not found." };
  }

  let moderationStatus = existing.moderationStatus;

  if (isPublic) {
    const linkStatus = await checkGoogleDriveLinkPublic(existing.fileUrl);
    if (linkStatus === "PRIVATE") {
      return { success: false, error: LINK_NOT_PUBLIC_ERROR };
    }
    moderationStatus = "APPROVED";
  }

  try {
    await prisma.studentNote.update({ where: { id }, data: { isPublic, moderationStatus } });
  } catch (err) {
    return handlePrismaError(err, "note");
  }

  revalidatePath(chapterPath(existing.chapterId));
  return { success: true };
}

import { NoteInteractionSchema, RateNoteSchema } from "@/schemas/student-notes";

function notesFeedPath() {
  return "/notes";
}

export async function toggleStudentNoteLike(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = NoteInteractionSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const note = await prisma.studentNote.findFirst({
    where: { id, isPublic: true, moderationStatus: "APPROVED" },
    select: { id: true, studentId: true, chapterId: true },
  });
  if (!note) return { success: false, error: "Note not found." };
  if (note.studentId === profile.id) {
    return { success: false, error: "You can't like your own note." };
  }

  try {
    const existing = await prisma.studentNoteLike.findUnique({
      where: { noteId_studentId: { noteId: id, studentId: profile.id } },
    });
    if (existing) {
      await prisma.studentNoteLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.studentNoteLike.create({ data: { noteId: id, studentId: profile.id } });
    }
  } catch (err) {
    return handlePrismaError(err, "like");
  }

  revalidatePath(notesFeedPath());
  revalidatePath(`/chapter/${note.chapterId}`);
  return { success: true };
}

export async function rateStudentNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = RateNoteSchema.safeParse({
    id: formValue(formData, "id"),
    rating: formValue(formData, "rating"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, rating } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const note = await prisma.studentNote.findFirst({
    where: { id, isPublic: true, moderationStatus: "APPROVED" },
    select: { id: true, studentId: true, chapterId: true },
  });
  if (!note) return { success: false, error: "Note not found." };
  if (note.studentId === profile.id) {
    return { success: false, error: "You can't rate your own note." };
  }

  try {
    await prisma.studentNoteRating.upsert({
      where: { noteId_studentId: { noteId: id, studentId: profile.id } },
      create: { noteId: id, studentId: profile.id, rating },
      update: { rating },
    });
  } catch (err) {
    return handlePrismaError(err, "rating");
  }

  revalidatePath(notesFeedPath());
  revalidatePath(`/chapter/${note.chapterId}`);
  return { success: true };
}

import {
  CommentOnNoteSchema,
  UpdateNoteCommentSchema,
  DeleteNoteCommentSchema,
} from "@/schemas/student-notes";

export async function commentOnStudentNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = CommentOnNoteSchema.safeParse({
    noteId: formValue(formData, "noteId"),
    body: formValue(formData, "body"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { noteId, body } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const note = await prisma.studentNote.findFirst({
    where: { id: noteId, isPublic: true, moderationStatus: "APPROVED" },
    select: { id: true, chapterId: true },
  });
  if (!note) return { success: false, error: "Note not found." };

  try {
    await prisma.studentNoteComment.create({
      data: { noteId, studentId: profile.id, body },
    });
  } catch (err) {
    return handlePrismaError(err, "comment");
  }

  revalidatePath(notesFeedPath());
  revalidatePath(`/chapter/${note.chapterId}`);
  return { success: true };
}

export async function updateStudentNoteComment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = UpdateNoteCommentSchema.safeParse({
    id: formValue(formData, "id"),
    body: formValue(formData, "body"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, body } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const existing = await prisma.studentNoteComment.findUnique({ where: { id } });
  if (!existing || existing.studentId !== profile.id) {
    return { success: false, error: "Comment not found." };
  }

  try {
    await prisma.studentNoteComment.update({ where: { id }, data: { body } });
  } catch (err) {
    return handlePrismaError(err, "comment");
  }

  revalidatePath(notesFeedPath());
  return { success: true };
}

export async function deleteStudentNoteComment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = DeleteNoteCommentSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const existing = await prisma.studentNoteComment.findUnique({ where: { id } });
  if (!existing || existing.studentId !== profile.id) {
    return { success: false, error: "Comment not found." };
  }

  try {
    await prisma.studentNoteComment.delete({ where: { id } });
  } catch (err) {
    return handlePrismaError(err, "comment");
  }

  revalidatePath(notesFeedPath());
  return { success: true };
}
