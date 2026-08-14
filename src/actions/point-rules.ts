"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import { PointRuleUpdateSchema } from "@/schemas/point-rules";

export async function updatePointRule(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = PointRuleUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    value: formValue(formData, "value"),
    secondaryValue: formValue(formData, "secondaryValue"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, value, secondaryValue } = parsed.data;

  const isActive = formValue(formData, "isActive") === "true";

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.pointRule.findUniqueOrThrow({ where: { id } });
      const rule = await tx.pointRule.update({
        where: { id },
        data: { value, secondaryValue: secondaryValue ?? null, isActive },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "PointRule",
        entityId: rule.id,
        metadata: { before, after: rule },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "point rule");
  }

  revalidatePath("/admin/point-rules");
  return { success: true };
}
