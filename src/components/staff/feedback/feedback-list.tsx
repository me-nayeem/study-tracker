"use client";

import Link from "next/link";
import { useActionState } from "react";
import { markFeedbackReviewed } from "@/actions/feedback";
import type { getFeedbackList } from "@/lib/feedback-data";

type FeedbackItem = Awaited<ReturnType<typeof getFeedbackList>>["items"][number];

const CATEGORY_LABELS: Record<string, string> = {
  BUG: "Bug report",
  SUGGESTION: "Suggestion",
  GENERAL: "General",
};

export function FeedbackList({
  items,
  reviewedFilter,
  page,
  totalPages,
}: {
  items: FeedbackItem[];
  reviewedFilter: boolean | undefined;
  page: number;
  totalPages: number;
}) {
  function buildHref(overrides: { reviewed?: string; page?: number }) {
    const sp = new URLSearchParams();
    const reviewedValue =
      "reviewed" in overrides
        ? overrides.reviewed
        : reviewedFilter !== undefined
          ? String(reviewedFilter)
          : undefined;

    if (reviewedValue !== undefined) sp.set("reviewed", reviewedValue);
    sp.set("page", String(overrides.page ?? 1));
    return `/manager/feedback?${sp.toString()}`;
  }

  const tabClass = (active: boolean) =>
    active
      ? "bg-accent-primary text-background rounded-full px-3 py-1.5 text-xs font-medium"
      : "border-bg-elevated text-text-secondary rounded-full border px-3 py-1.5 text-xs";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Link
          href={buildHref({ reviewed: undefined, page: 1 })}
          className={tabClass(reviewedFilter === undefined)}
        >
          All
        </Link>
        <Link
          href={buildHref({ reviewed: "false", page: 1 })}
          className={tabClass(reviewedFilter === false)}
        >
          Unreviewed
        </Link>
        <Link
          href={buildHref({ reviewed: "true", page: 1 })}
          className={tabClass(reviewedFilter === true)}
        >
          Reviewed
        </Link>
      </div>

      <div className="border-bg-elevated bg-bg-surface overflow-hidden rounded-xl border">
        {items.length === 0 ? (
          <p className="text-text-secondary p-6 text-center text-sm">No feedback here.</p>
        ) : (
          items.map((item) => <FeedbackRow key={item.id} item={item} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: p })}
              className={
                p === page
                  ? "bg-accent-primary text-background rounded-md px-3 py-1.5 text-xs font-medium"
                  : "border-bg-elevated text-text-secondary rounded-md border px-3 py-1.5 text-xs"
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackRow({ item }: { item: FeedbackItem }) {
  const [state, action, pending] = useActionState(markFeedbackReviewed, { success: false });

  return (
    <div className="border-bg-elevated border-b p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-accent-gamify/10 text-accent-gamify rounded-full px-2 py-0.5 text-xs font-medium">
              {CATEGORY_LABELS[item.category] ?? item.category}
            </span>
            <span className="text-text-secondary text-xs">
              {item.student.user.name ?? item.student.user.email ?? "Unknown student"}
            </span>
          </div>
          <p className="text-foreground mt-2 text-sm whitespace-pre-wrap">{item.message}</p>
          <p className="text-text-secondary mt-2 text-xs">{item.createdAt.toLocaleDateString()}</p>
        </div>

        {!item.isReviewed ? (
          <form action={action}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={pending}
              className="bg-state-success/10 text-state-success shrink-0 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              {pending ? "..." : "Mark reviewed"}
            </button>
          </form>
        ) : (
          <span className="text-state-success shrink-0 text-xs">✓ Reviewed</span>
        )}
      </div>
      {state.error && <p className="text-state-warning mt-2 text-xs">{state.error}</p>}
    </div>
  );
}
