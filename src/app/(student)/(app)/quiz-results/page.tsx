import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getStudentQuizResultsWithReview } from "@/lib/quiz-data";
import { QuizResultsList } from "@/components/student/quiz-results-list";

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
      <section
        className="border-gold/20 from-bg-surface to-ink relative overflow-hidden rounded-2xl border bg-linear-to-b p-4 sm:p-6"
        style={{ "--card-accent": "#9d7cff" } as React.CSSProperties}
      >
        <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-(--card-accent) opacity-20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="border-gold/30 relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/40">
            <span className="absolute h-8 w-8 rounded-full bg-(--card-accent) opacity-30 blur-md" />
            <span aria-hidden="true" className="relative text-2xl leading-none">
              📊
            </span>
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
          <div className="relative mt-4 flex flex-wrap gap-2">
            <span className="border-state-success/30 bg-state-success/10 text-state-success rounded-full border px-3 py-1 text-xs font-semibold">
              {masteredCount} mastered
            </span>
            <span className="border-state-warning/30 bg-state-warning/10 text-state-warning rounded-full border px-3 py-1 text-xs font-semibold">
              {reviewCount} need review
            </span>
          </div>
        )}
      </section>

      <QuizResultsList results={results} />
    </div>
  );
}
