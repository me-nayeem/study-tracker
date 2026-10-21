import "server-only";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getChapterDetail } from "@/lib/student-data";
import { getViewer } from "@/lib/viewer";

/**
 * Shared guard for the chapter page and its sub-pages: signed-in student with a profile,
 * and the chapter must belong to the student's track (404 otherwise).
 */
export async function requireStudentChapter(chapterId: string) {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const detail = await getChapterDetail(chapterId, profile.id, profile.trackId);

  if (!detail) {
    notFound();
  }

  return { user, profile, ...detail };
}

/**
 * The chapter overview is public: a signed-in student gets their progress, a visitor gets the
 * chapter from the public track without it. 404 when the chapter isn't in that track.
 */
export async function getChapterForViewer(chapterId: string) {
  const viewer = await getViewer();
  const detail = viewer.trackId
    ? await getChapterDetail(chapterId, viewer.profile?.id ?? null, viewer.trackId)
    : null;

  if (!detail) {
    notFound();
  }

  return { viewer, ...detail };
}
