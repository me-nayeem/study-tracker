import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";

/** The track shown to visitors who aren't signed in: the oldest active track. */
export const getPublicTrackId = cache(async (): Promise<string | null> => {
  const track = await prisma.track.findFirst({
    where: { isArchived: false },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return track?.id ?? null;
});

export type Viewer =
  | {
      kind: "student";
      user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
      profile: NonNullable<Awaited<ReturnType<typeof getStudentProfile>>>;
      trackId: string;
    }
  | { kind: "guest"; user: null; profile: null; trackId: string | null };

/**
 * Who is looking at a public student page (dashboard, paper, chapter overview).
 * A signed-in user without a student profile is still sent to onboarding, as before.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await getCurrentUser();
  if (!user) {
    return { kind: "guest", user: null, profile: null, trackId: await getPublicTrackId() };
  }

  const profile = await getStudentProfile(user.id);
  if (!profile) {
    redirect("/onboarding");
  }
  return { kind: "student", user, profile, trackId: profile.trackId };
});
