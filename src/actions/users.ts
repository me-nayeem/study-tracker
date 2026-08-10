"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import {
  handlePrismaError,
  fieldErrorState,
  LastAdminError,
  type ActionState,
} from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { ChangeRoleSchema, UserIdSchema } from "@/schemas/user-management";

const STAFF_ROLES_PATH = "/admin/staff-roles";

export async function changeUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = ChangeRoleSchema.safeParse({
    userId: formValue(formData, "userId"),
    newRole: formValue(formData, "newRole"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { userId, newRole } = parsed.data;

  if (userId === actor.id) {
    return { success: false, error: "You can't change your own role from this panel." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const targetUser = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      if (targetUser.role === "ADMIN" && newRole !== "ADMIN") {
        const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          throw new LastAdminError();
        }
      }

      const updated = await tx.user.update({ where: { id: userId }, data: { role: newRole } });

      await logAudit(tx, {
        actorId: actor.id,
        action: "ROLE_CHANGED",
        entityType: "User",
        entityId: updated.id,
        metadata: { from: targetUser.role, to: newRole },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "user");
  }

  revalidatePath(STAFF_ROLES_PATH);
  return { success: true };
}

export async function setUserActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = UserIdSchema.safeParse({ userId: formValue(formData, "userId") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { userId } = parsed.data;
  const isActive = formValue(formData, "isActive") === "true";

  if (userId === actor.id && !isActive) {
    return { success: false, error: "You can't deactivate your own account." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: userId }, data: { isActive } });
      await logAudit(tx, {
        actorId: actor.id,
        action: isActive ? "ACTIVATED" : "DEACTIVATED",
        entityType: "User",
        entityId: updated.id,
        metadata: { isActive },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "user");
  }

  revalidatePath(STAFF_ROLES_PATH);
  return { success: true };
}
