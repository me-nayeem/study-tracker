import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Feature keys this user already asked to be notified about.
 * Never throws: if the table isn't migrated yet the pages still render (buttons just show).
 */
export async function getSubscribedFeatureKeys(userId: string): Promise<string[]> {
  try {
    const rows = await prisma.featureSubscription.findMany({
      where: { userId },
      select: { featureKey: true },
    });
    return rows.map((r) => r.featureKey);
  } catch (err) {
    console.error("getSubscribedFeatureKeys failed", err);
    return [];
  }
}
