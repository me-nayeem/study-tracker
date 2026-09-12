"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { GrantManualProSchema, RevokeManualProSchema } from "@/schemas/subscription";

export async function grantManualPro(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = GrantManualProSchema.safeParse({
    userId: formValue(formData, "userId"),
    days: formValue(formData, "days"),
    paymentReference: formValue(formData, "paymentReference"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { userId, days, paymentReference } = parsed.data;

  const currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  try {
    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          status: "ACTIVE",
          currentPeriodEnd,
          paymentReference: paymentReference || null,
          grantedByUserId: actor.id,
        },
        update: {
          status: "ACTIVE",
          currentPeriodEnd,
          paymentReference: paymentReference || null,
          grantedByUserId: actor.id,
        },
      });

      await logAudit(tx, {
        actorId: actor.id,
        action: "MANUAL_ADJUSTMENT",
        entityType: "Subscription",
        entityId: subscription.id,
        metadata: { userId, days, currentPeriodEnd, paymentReference },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "subscription");
  }

  revalidatePath("/manager/students");
  return { success: true };
}

export async function revokeManualPro(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = RevokeManualProSchema.safeParse({
    userId: formValue(formData, "userId"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { userId } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.update({
        where: { userId },
        data: { status: "CANCELED" },
      });

      await logAudit(tx, {
        actorId: actor.id,
        action: "MANUAL_ADJUSTMENT",
        entityType: "Subscription",
        entityId: subscription.id,
        metadata: { userId, revoked: true },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "subscription");
  }

  revalidatePath("/manager/students");
  return { success: true };
}