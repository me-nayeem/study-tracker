import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStale, abandonSession } from "@/lib/session-abandon";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const candidates = await prisma.studySession.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, studentId: true, lastHeartbeatAt: true },
  });

  let processed = 0;
  for (const session of candidates) {
    if (!isStale(session.lastHeartbeatAt, now)) continue;
    await prisma.$transaction(async (tx) => {
      await abandonSession(tx, session);
    });
    processed++;
  }

  return NextResponse.json({ ok: true, checked: candidates.length, processed });
}
