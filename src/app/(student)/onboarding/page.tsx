import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { OnboardingForm } from "@/components/student/onboarding-form";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-foreground mb-1 text-2xl">Let's set you up</h1>
        <p className="text-text-secondary mb-6 text-sm">
          A few details so we can show you the right curriculum.
        </p>
        <OnboardingForm />
      </div>
    </div>
  );
}
