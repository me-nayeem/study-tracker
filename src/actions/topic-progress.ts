"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { ToggleTopicProgressSchema } from "@/schemas/topic-progress";

export async function toggleTopicProgress(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = ToggleTopicProgressSchema.safeParse({
    topicId: formValue(formData, "topicId"),
    field: formValue(formData, "field"),
    value: formValue(formData, "value"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { topicId, field, value } = parsed.data;

  const profile = await getStudentProfile(user.id);
  if (!profile) {
    return { success: false, error: "No student profile found." };
  }

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, isArchived: false },
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

  if (!topic || topic.chapter.paper.subject.trackId !== profile.trackId) {
    return { success: false, error: "Topic not found." };
  }

  const chapterId = topic.chapterId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.topicProgress.upsert({
        where: { studentId_topicId: { studentId: profile.id, topicId } },
        create: {
          studentId: profile.id,
          topicId,
          readDone: field === "readDone" ? value : false,
          lectureDone: field === "lectureDone" ? value : false,
          solvedDone: field === "solvedDone" ? value : false,
        },
        update: { [field]: value },
      });

      const mastery = await tx.chapterMastery.findUnique({
        where: { studentId_chapterId: { studentId: profile.id, chapterId } },
        select: { status: true },
      });

      if (!mastery) {
        await tx.chapterMastery.create({
          data: { studentId: profile.id, chapterId, status: "IN_PROGRESS" },
        });
      } else if (mastery.status === "NOT_STARTED") {
        await tx.chapterMastery.update({
          where: { studentId_chapterId: { studentId: profile.id, chapterId } },
          data: { status: "IN_PROGRESS" },
        });
      }
    });
  } catch (err) {
    return handlePrismaError(err, "progress");
  }

  revalidatePath(`/chapter/${chapterId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
