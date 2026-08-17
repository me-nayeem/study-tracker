import { requireRole } from "@/lib/dal";
import { getFeedbackList } from "@/lib/feedback-data";
import { FeedbackList } from "@/components/staff/feedback/feedback-list";

export default async function ManagerFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewed?: string; page?: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const params = await searchParams;
  const reviewed =
    params.reviewed === "true" ? true : params.reviewed === "false" ? false : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, totalPages } = await getFeedbackList({ reviewed, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Feedback</h1>
        <p className="text-text-secondary mt-1 text-sm">{total} submission(s)</p>
      </div>
      <FeedbackList items={items} reviewedFilter={reviewed} page={page} totalPages={totalPages} />
    </div>
  );
}
