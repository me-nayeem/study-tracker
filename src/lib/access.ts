import "server-only";
import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@/generated/prisma/enums";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

export function isSubscriptionActive(
  sub: { status: SubscriptionStatus; currentPeriodEnd: Date | null } | null | undefined
): boolean {
  if (!sub) return false;
  if (!ACTIVE_STATUSES.includes(sub.status)) return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

export async function hasProAccess(studentId: string): Promise<boolean> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: {
      user: {
        select: {
          subscription: { select: { status: true, currentPeriodEnd: true } },
        },
      },
    },
  });

  return isSubscriptionActive(profile?.user.subscription);
}

export async function hasChapterCoreAccess(
  studentId: string,
  chapter: { isFreePreview: boolean }
): Promise<boolean> {
  if (chapter.isFreePreview) return true;
  return hasProAccess(studentId);
}