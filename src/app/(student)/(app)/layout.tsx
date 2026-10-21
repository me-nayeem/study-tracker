import { requireUser } from "@/lib/dal";
import { getViewer } from "@/lib/viewer";
import { StudentFrame } from "@/components/student/student-frame";

/** Signed-in student pages. Visitors are sent to /login (by the proxy, and again here). */
export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  // signed in, so this is a student (or a redirect to onboarding when the profile is missing)
  const viewer = await getViewer();

  return <StudentFrame viewer={viewer}>{children}</StudentFrame>;
}
