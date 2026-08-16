"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formValue } from "@/lib/form-data";
import { AccountSchema } from "@/schemas/account";
import { fieldErrorState, handlePrismaError, type ActionState } from "@/lib/prisma-errors";

export async function updateAccount(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = AccountSchema.safeParse({
    name: formValue(formData, "name"),
    board: formValue(formData, "board"),
    institutionName: formValue(formData, "institutionName"),
    phoneNumber: formValue(formData, "phoneNumber"),
  });

  if (!parsed.success) {
    return fieldErrorState(parsed.error);
  }

  const { name, board, institutionName, phoneNumber } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name },
      }),
      prisma.studentProfile.update({
        where: { userId: user.id },
        data: { board, institutionName, phoneNumber },
      }),
    ]);
  } catch (err) {
    return handlePrismaError(err, "account");
  }

  revalidatePath("/account");
  return { success: true, data: { name } };
}
