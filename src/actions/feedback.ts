"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { logAudit } from "@/lib/audit";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { CreateFeedbackSchema, FeedbackIdSchema } from "@/schemas/feedback";

export async function submitFeedback(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const parsed = CreateFeedbackSchema.safeParse({
    category: formValue(formData, "category"),
    message: formValue(formData, "message"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  try {
    await prisma.feedback.create({
      data: {
        studentId: profile.id,
        category: parsed.data.category,
        message: parsed.data.message,
      },
    });
  } catch (err) {
    return handlePrismaError(err, "feedback");
  }

  revalidatePath("/feedback");
  return { success: true };
}

export async function markFeedbackReviewed(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const parsed = FeedbackIdSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  try {
    await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.update({
        where: { id: parsed.data.id },
        data: { isReviewed: true, reviewedByUserId: actor.id },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Feedback",
        entityId: feedback.id,
        metadata: { isReviewed: true },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "feedback");
  }

  revalidatePath("/manager/feedback");
  return { success: true };
}