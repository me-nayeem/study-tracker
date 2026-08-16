import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { AccountForm } from "@/components/student/account-form";

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-foreground mb-1 text-xl">Account</h1>
      <p className="text-text-secondary mb-6 text-sm">Manage your profile details.</p>
      <AccountForm user={{ name: user.name, email: user.email }} profile={profile} />
    </div>
  );
}
