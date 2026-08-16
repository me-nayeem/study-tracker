"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitPlaylistReview } from "@/actions/content";

export function PlaylistReviewPopover({
  playlistId,
  ownRating,
  ownComment,
}: {
  playlistId: string;
  ownRating: number | null;
  ownComment: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(ownRating ?? 0);
  const [comment, setComment] = useState(ownComment ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    const formData = new FormData();
    formData.set("playlistId", playlistId);
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    startTransition(() => {
      submitPlaylistReview({ success: false }, formData);
    });
    setOpen(false);
  }

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-text-secondary hover:bg-bg-elevated hover:text-foreground flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        <Star
          className={ownRating ? "text-accent-gamify h-4 w-4" : "h-4 w-4"}
          fill={ownRating ? "currentColor" : "none"}
        />
        Review
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-elevated border-bg-surface w-full max-w-xs space-y-3 rounded-lg border p-4 shadow-xl"
          >
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <Star
                    className={`h-6 w-6 ${star <= rating ? "text-accent-gamify" : "text-text-secondary/40"}`}
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              maxLength={1000}
              rows={2}
              className="bg-bg-surface text-foreground placeholder:text-text-secondary w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPending || rating === 0}
              className="bg-accent-primary text-background w-full rounded-lg py-2 text-sm font-medium disabled:opacity-40"
            >
              {isPending ? "Saving..." : "Submit review"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
