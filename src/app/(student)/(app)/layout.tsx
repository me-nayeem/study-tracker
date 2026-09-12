import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { hasProAccess } from "@/lib/access";
import { StudentShell } from "@/components/student/student-shell";
import { FloatingCalculator } from "@/components/student/floating-calculator";

export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const isProActive = await hasProAccess(profile.id);

  return (
    <StudentShell name={user.name} email={user.email} image={user.image} isProActive={isProActive}>
      {children}
      <FloatingCalculator />
    </StudentShell>
  );
}