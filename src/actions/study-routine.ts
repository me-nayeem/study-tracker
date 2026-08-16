"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import {
  StudyRoutineSchema,
  StudyRoutineUpdateSchema,
  StudyRoutineItemSchema,
  StudyRoutineItemUpdateSchema,
  RoutineIdSchema,
  RoutineItemIdSchema,
} from "@/schemas/study-routine";

const ROUTINE_PATH = "/routine";

export async function createStudyRoutine(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = StudyRoutineSchema.safeParse({ title: formValue(formData, "title") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  try {
    await prisma.studyRoutine.create({
      data: { studentId: profile.id, title: parsed.data.title },
    });
  } catch (err) {
    return handlePrismaError(err, "routine");
  }

  revalidatePath(ROUTINE_PATH);
  return { success: true };
}

export async function setStudyRoutineActive(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = RoutineIdSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isActive = formValue(formData, "isActive") === "true";

  const existing = await prisma.studyRoutine.findUnique({ where: { id: parsed.data.id } });
  if (!existing || existing.studentId !== profile.id) {
    return { success: false, error: "Routine not found." };
  }

  try {
    await prisma.studyRoutine.update({ where: { id: parsed.data.id }, data: { isActive } });
  } catch (err) {
    return handlePrismaError(err, "routine");
  }

  revalidatePath(ROUTINE_PATH);
  return { success: true };
}

export async function deleteStudyRoutine(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = RoutineIdSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const existing = await prisma.studyRoutine.findUnique({ where: { id: parsed.data.id } });
  if (!existing || existing.studentId !== profile.id) {
    return { success: false, error: "Routine not found." };
  }

  try {
    await prisma.studyRoutine.delete({ where: { id: parsed.data.id } });
  } catch (err) {
    return handlePrismaError(err, "routine");
  }

  revalidatePath(ROUTINE_PATH);
  return { success: true };
}

export async function createStudyRoutineItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = StudyRoutineItemSchema.safeParse({
    routineId: formValue(formData, "routineId"),
    dayOfWeek: formValue(formData, "dayOfWeek"),
    startMinute: formValue(formData, "startMinute"),
    endMinute: formValue(formData, "endMinute"),
    subjectId: formValue(formData, "subjectId"),
    label: formValue(formData, "label"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { routineId, dayOfWeek, startMinute, endMinute, subjectId, label } = parsed.data;

  const routine = await prisma.studyRoutine.findUnique({ where: { id: routineId } });
  if (!routine || routine.studentId !== profile.id) {
    return { success: false, error: "Routine not found." };
  }

  if (subjectId) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, trackId: profile.trackId, isArchived: false },
    });
    if (!subject) return { success: false, error: "Subject not found." };
  }

  try {
    await prisma.studyRoutineItem.create({
      data: {
        routineId,
        dayOfWeek,
        startMinute,
        endMinute,
        subjectId: subjectId ?? null,
        label: label ?? null,
      },
    });
  } catch (err) {
    return handlePrismaError(err, "routine item");
  }

  revalidatePath(ROUTINE_PATH);
  return { success: true };
}

export async function updateStudyRoutineItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = StudyRoutineItemUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    dayOfWeek: formValue(formData, "dayOfWeek"),
    startMinute: formValue(formData, "startMinute"),
    endMinute: formValue(formData, "endMinute"),
    subjectId: formValue(formData, "subjectId"),
    label: formValue(formData, "label"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, dayOfWeek, startMinute, endMinute, subjectId, label } = parsed.data;

  const existing = await prisma.studyRoutineItem.findUnique({
    where: { id },
    include: { routine: { select: { studentId: true } } },
  });
  if (!existing || existing.routine.studentId !== profile.id) {
    return { success: false, error: "Routine item not found." };
  }

  if (subjectId) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, trackId: profile.trackId, isArchived: false },
    });
    if (!subject) return { success: false, error: "Subject not found." };
  }

  try {
    await prisma.studyRoutineItem.update({
      where: { id },
      data: {
        dayOfWeek,
        startMinute,
        endMinute,
        subjectId: subjectId ?? null,
        label: label ?? null,
      },
    });
  } catch (err) {
    return handlePrismaError(err, "routine item");
  }

  revalidatePath(ROUTINE_PATH);
  return { success: true };
}

export async function deleteStudyRoutineItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = RoutineItemIdSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const existing = await prisma.studyRoutineItem.findUnique({
    where: { id: parsed.data.id },
    include: { routine: { select: { studentId: true } } },
  });
  if (!existing || existing.routine.studentId !== profile.id) {
    return { success: false, error: "Routine item not found." };
  }

  try {
    await prisma.studyRoutineItem.delete({ where: { id: parsed.data.id } });
  } catch (err) {
    return handlePrismaError(err, "routine item");
  }

  revalidatePath(ROUTINE_PATH);
  return { success: true };
}
