"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { fieldErrorState, handlePrismaError, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";

const DismissNotificationSchema = z.object({ id: z.string().min(1, "Missing id.") });

export async function dismissNotification(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = DismissNotificationSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return { success: false, error: "Notification not found." };
  }

  try {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
  } catch (err) {
    return handlePrismaError(err, "notification");
  }

  revalidatePath("/dashboard");
  return { success: true };
}
