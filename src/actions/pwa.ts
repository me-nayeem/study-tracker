"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";

export async function dismissPwaInstallPrompt(): Promise<{ success: boolean }> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false };

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { pwaInstallDismissedAt: new Date() },
  });

  return { success: true };
}

export async function markPwaInstalled(): Promise<{ success: boolean }> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false };

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { pwaInstalled: true },
  });

  return { success: true };
}
