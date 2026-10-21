import { hasProAccess } from "@/lib/access";
import type { Viewer } from "@/lib/viewer";
import { StudentShell } from "./student-shell";
import { FloatingCalculator } from "./floating-calculator";

/** Student app chrome (sidebar, top bar, bottom nav, calculator) for a student or a visitor. */
export async function StudentFrame({
  viewer,
  children,
}: {
  viewer: Viewer;
  children: React.ReactNode;
}) {
  if (viewer.kind === "guest") {
    return (
      <StudentShell guest isProActive={false}>
        {children}
        <FloatingCalculator />
      </StudentShell>
    );
  }

  const isProActive = await hasProAccess(viewer.profile.id);

  return (
    <StudentShell
      name={viewer.user.name}
      email={viewer.user.email}
      image={viewer.user.image}
      isProActive={isProActive}
    >
      {children}
      <FloatingCalculator />
    </StudentShell>
  );
}
