import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getStudentQuizResultsWithReview } from "@/lib/quiz-data";
import { QuizResultsList } from "@/components/student/quiz-results-list";
import { headerTileClass } from "@/components/shared/classes";

export default async function QuizResultsPage() {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  const results = await getStudentQuizResultsWithReview(profile.id);
  const masteredCount = results.filter((r) => r.mastery.status === "MASTERED").length;
  const reviewCount = results.length - masteredCount;

  return (
    <div className="space-y-6">
      <section className="card-surface p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={headerTileClass}>
            📊
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
              Quiz results
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              Every chapter quiz you have taken. Failed ones show what to review.
            </p>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-state-success/10 text-state-success rounded-full px-3 py-1 text-xs font-semibold">
              {masteredCount} mastered
            </span>
            <span className="bg-state-warning/10 text-state-warning rounded-full px-3 py-1 text-xs font-semibold">
              {reviewCount} need review
            </span>
          </div>
        )}
      </section>

      <QuizResultsList results={results} />
    </div>
  );
}
