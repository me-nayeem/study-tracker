"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { isFeatureKey } from "@/lib/coming-soon";

export async function subscribeToFeature(
  featureKey: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();

  if (!isFeatureKey(featureKey)) {
    return { success: false, error: "Unknown feature." };
  }

  try {
    await prisma.featureSubscription.upsert({
      where: { userId_featureKey: { userId: user.id, featureKey } },
      create: { userId: user.id, featureKey },
      update: {},
    });
  } catch (err) {
    console.error("subscribeToFeature failed", err);
    return { success: false, error: "Couldn't save that. Please try again." };
  }

  // Notify-me buttons live on many pages; refresh them all so a page the student already
  // visited doesn't come back from the client cache still showing the button.
  revalidatePath("/", "layout");

  return { success: true };
}
