import type { Prisma } from "@/generated/prisma/client";

export const ABANDON_THRESHOLD_SECONDS = 8 * 60;

export function isStale(lastHeartbeatAt: Date | null, now: Date): boolean {
  if (!lastHeartbeatAt) return true;
  return now.getTime() - lastHeartbeatAt.getTime() > ABANDON_THRESHOLD_SECONDS * 1000;
}

export async function abandonSession(
  tx: Prisma.TransactionClient,
  session: { id: string; studentId: string; lastHeartbeatAt: Date | null }
): Promise<void> {
  const endedAt = session.lastHeartbeatAt ?? new Date();
  await tx.studySession.update({
    where: { id: session.id },
    data: { status: "ABANDONED", endedAt },
  });
}
