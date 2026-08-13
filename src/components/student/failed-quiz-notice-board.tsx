"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { dismissNotification } from "@/actions/notifications";
import type { ChapterReviewNotice } from "@/lib/notifications-data";

export function FailedQuizNoticeBoard({ notices }: { notices: ChapterReviewNotice[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const visible = notices.filter((n) => !dismissed.has(n.id));
  if (visible.length === 0) return null;

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await dismissNotification({ success: false }, formData);
      if (!result.success) {
        setDismissed((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  }

  return (
    <div className="space-y-3">
      {visible.map((notice) => (
        <div
          key={notice.id}
          className="border-state-warning/40 bg-state-warning/10 relative rounded-xl border p-4 pr-10"
        >
          <button
            type="button"
            onClick={() => handleDismiss(notice.id)}
            disabled={isPending}
            aria-label="Dismiss"
            className="text-text-secondary hover:text-foreground absolute top-3 right-3"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-foreground text-sm font-medium">{notice.title}</p>
          <p className="text-text-secondary mt-1 text-sm">{notice.body}</p>
          <Link
            href="/quiz-results"
            className="text-accent-primary mt-2 inline-block text-xs underline-offset-4 hover:underline"
          >
            Review your quiz results
          </Link>
        </div>
      ))}
    </div>
  );
}