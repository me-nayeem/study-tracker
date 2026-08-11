"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import {
  handlePrismaError,
  fieldErrorState,
  ChapterAlreadySubmittedError,
  type ActionState,
} from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { MarkChapterCompleteSchema } from "@/schemas/chapter-mastery";

export async function markChapterComplete(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = MarkChapterCompleteSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) {
    return { success: false, error: "No student profile found." };
  }

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, isArchived: false },
    select: {
      id: true,
      paper: { select: { subject: { select: { trackId: true } } } },
    },
  });

  if (!chapter || chapter.paper.subject.trackId !== profile.trackId) {
    return { success: false, error: "Chapter not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.chapterMastery.findUnique({
        where: { studentId_chapterId: { studentId: profile.id, chapterId } },
        select: { status: true },
      });

      if (existing && existing.status !== "NOT_STARTED" && existing.status !== "IN_PROGRESS") {
        throw new ChapterAlreadySubmittedError();
      }

      await tx.chapterMastery.upsert({
        where: { studentId_chapterId: { studentId: profile.id, chapterId } },
        create: {
          studentId: profile.id,
          chapterId,
          status: "AWAITING_QUIZ",
          markedCompleteAt: new Date(),
        },
        update: {
          status: "AWAITING_QUIZ",
          markedCompleteAt: new Date(),
        },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "chapter");
  }

  revalidatePath(`/chapter/${chapterId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
