import { getViewer } from "@/lib/viewer";
import { StudentFrame } from "@/components/student/student-frame";

/**
 * Pages anyone can open: dashboard, paper chapter lists and chapter overviews.
 * Signed-in students see their progress; visitors see the same pages without it.
 * Everything a visitor taps from here that needs an account goes through /login.
 */
export default async function StudentPublicLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return <StudentFrame viewer={viewer}>{children}</StudentFrame>;
}
