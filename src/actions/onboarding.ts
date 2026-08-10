"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formValue } from "@/lib/form-data";
import { OnboardingSchema } from "@/schemas/onboarding";
import { matchTrackForLevelGroup } from "@/lib/track-matching";
import { fieldErrorState, handlePrismaError, type ActionState } from "@/lib/prisma-errors";

export async function completeOnboarding(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const existing = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existing) {
    redirect("/dashboard");
  }

  const parsed = OnboardingSchema.safeParse({
    level: formValue(formData, "level"),
    group: formValue(formData, "group"),
    board: formValue(formData, "board"),
    institutionName: formValue(formData, "institutionName"),
    phoneNumber: formValue(formData, "phoneNumber"),
  });

  if (!parsed.success) {
    return fieldErrorState(parsed.error);
  }

  const { level, group, board, institutionName, phoneNumber } = parsed.data;

  const match = await matchTrackForLevelGroup(level, group);
  if (!match.found) {
    return {
      success: false,
      error: "No track is available yet for this level and group. Please contact support.",
    };
  }

  try {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        trackId: match.trackId,
        board,
        institutionName,
        phoneNumber,
      },
    });
  } catch (err) {
    return handlePrismaError(err, "student profile");
  }

  redirect("/dashboard");
}
