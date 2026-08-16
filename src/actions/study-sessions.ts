"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { addStudyTimeSeconds } from "@/lib/study-time";
import { isStale, abandonSession } from "@/lib/session-abandon";
import type { SessionType } from "@/generated/prisma/enums";

const MAX_HEARTBEAT_GAP_SECONDS = 8 * 60;

export type StudySessionActionResult =
  { success: true; sessionId: string; durationSeconds: number } | { success: false; error: string };

export type EndSessionResult =
  { success: true; durationSeconds: number } | { success: false; error: string };

async function requireOwnedSession(sessionId: string, studentId: string) {
  const session = await prisma.studySession.findUnique({ where: { id: sessionId } });
  if (!session || session.studentId !== studentId) return null;
  return session;
}

export async function startStudySession(params: {
  type: SessionType;
  subjectId?: string;
  chapterId?: string;
}): Promise<StudySessionActionResult> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const existing = await prisma.studySession.findFirst({
    where: { studentId: profile.id, status: { in: ["ACTIVE", "PAUSED"] } },
  });

  if (existing) {
    const now = new Date();
    if (existing.status === "ACTIVE" && isStale(existing.lastHeartbeatAt, now)) {
      await prisma.$transaction(async (tx) => {
        await abandonSession(tx, existing);
      });
    } else {
      return { success: false, error: "You already have a study session in progress." };
    }
  }

  const now = new Date();
  const session = await prisma.studySession.create({
    data: {
      studentId: profile.id,
      subjectId: params.subjectId ?? null,
      chapterId: params.chapterId ?? null,
      type: params.type,
      status: "ACTIVE",
      startedAt: now,
      lastHeartbeatAt: now,
      durationSeconds: 0,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, sessionId: session.id, durationSeconds: 0 };
}

export async function heartbeatStudySession(sessionId: string): Promise<StudySessionActionResult> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const session = await requireOwnedSession(sessionId, profile.id);
  if (!session || session.status !== "ACTIVE") {
    return { success: false, error: "Session not found or not active." };
  }

  const now = new Date();
  const rawDelta = Math.floor((now.getTime() - session.lastHeartbeatAt!.getTime()) / 1000);
  const delta = Math.max(0, Math.min(rawDelta, MAX_HEARTBEAT_GAP_SECONDS));
  const newDuration = (session.durationSeconds ?? 0) + delta;

  await prisma.$transaction(async (tx) => {
    await tx.studySession.update({
      where: { id: sessionId },
      data: { lastHeartbeatAt: now, durationSeconds: newDuration },
    });
    await addStudyTimeSeconds(tx, profile.id, profile.trackId, delta, now);
  });

  return { success: true, sessionId, durationSeconds: newDuration };
}

export async function pauseStudySession(sessionId: string): Promise<StudySessionActionResult> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const session = await requireOwnedSession(sessionId, profile.id);
  if (!session || session.status !== "ACTIVE") {
    return { success: false, error: "Session not found or not active." };
  }

  const now = new Date();
  const rawDelta = Math.floor((now.getTime() - session.lastHeartbeatAt!.getTime()) / 1000);
  const delta = Math.max(0, Math.min(rawDelta, MAX_HEARTBEAT_GAP_SECONDS));
  const newDuration = (session.durationSeconds ?? 0) + delta;

  await prisma.$transaction(async (tx) => {
    await tx.studySession.update({
      where: { id: sessionId },
      data: { status: "PAUSED", lastHeartbeatAt: now, durationSeconds: newDuration },
    });
    await addStudyTimeSeconds(tx, profile.id, profile.trackId, delta, now);
  });

  return { success: true, sessionId, durationSeconds: newDuration };
}

export async function resumeStudySession(sessionId: string): Promise<StudySessionActionResult> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const session = await requireOwnedSession(sessionId, profile.id);
  if (!session || session.status !== "PAUSED") {
    return { success: false, error: "Session not found or not paused." };
  }

  const now = new Date();
  await prisma.studySession.update({
    where: { id: sessionId },
    data: { status: "ACTIVE", lastHeartbeatAt: now },
  });

  return { success: true, sessionId, durationSeconds: session.durationSeconds ?? 0 };
}

export async function endStudySession(sessionId: string): Promise<EndSessionResult> {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) return { success: false, error: "No student profile found." };

  const session = await requireOwnedSession(sessionId, profile.id);
  if (!session || (session.status !== "ACTIVE" && session.status !== "PAUSED")) {
    return { success: false, error: "Session not found or already ended." };
  }

  const now = new Date();
  let finalDuration = session.durationSeconds ?? 0;
  let creditDelta = 0;

  if (session.status === "ACTIVE") {
    const rawDelta = Math.floor((now.getTime() - session.lastHeartbeatAt!.getTime()) / 1000);
    creditDelta = Math.max(0, Math.min(rawDelta, MAX_HEARTBEAT_GAP_SECONDS));
    finalDuration += creditDelta;
  }

  await prisma.$transaction(async (tx) => {
    await tx.studySession.update({
      where: { id: sessionId },
      data: { status: "ENDED", endedAt: now, durationSeconds: finalDuration },
    });

    if (creditDelta > 0) {
      await addStudyTimeSeconds(tx, profile.id, profile.trackId, creditDelta, now);
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return { success: true, durationSeconds: finalDuration };
}
