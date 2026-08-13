import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getStudentQuizResultsWithReview } from "@/lib/quiz-data";
import { QuizResultsList } from "@/components/student/quiz-results-list";

export default async function QuizResultsPage() {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) notFound();

  const results = await getStudentQuizResultsWithReview(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Quiz results</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Every chapter quiz you have taken. Failed ones show what to review.
        </p>
      </div>
      <QuizResultsList results={results} />
    </div>
  );
}