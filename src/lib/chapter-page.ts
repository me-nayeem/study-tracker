import "server-only";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getChapterDetail } from "@/lib/student-data";

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
