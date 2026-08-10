import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { StudentShell } from "@/components/student/student-shell";

export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <StudentShell name={user.name} email={user.email}>
      {children}
    </StudentShell>
  );
}
