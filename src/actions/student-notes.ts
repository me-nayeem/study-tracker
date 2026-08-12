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
    await prisma.studentNote.create({
      data: { studentId: profile.id, chapterId, title, fileUrl, isPublic, moderationStatus },
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
