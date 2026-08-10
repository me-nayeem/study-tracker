import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getStudentDashboardData } from "@/lib/student-data";
import { SubjectList } from "@/components/student/subject-list";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const track = await getStudentDashboardData(profile.trackId);

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl">Dashboard</h1>
      <p className="text-text-secondary mt-1 text-sm">{track?.name}</p>

      <div className="mt-6">
        <SubjectList track={track} />
      </div>
    </div>
  );
}
