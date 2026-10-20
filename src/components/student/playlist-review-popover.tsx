"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitPlaylistReview } from "@/actions/content";
import { Modal } from "@/components/shared/modal";
import { useToast } from "@/components/shared/dialog-provider";

export function PlaylistReviewPopover({
  playlistId,
  playlistTitle,
  ownRating,
  ownComment,
  triggerClassName,
}: {
  playlistId: string;
  playlistTitle?: string;
  ownRating: number | null;
  ownComment: string | null;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(ownRating ?? 0);
  const [comment, setComment] = useState(ownComment ?? "");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    const formData = new FormData();
    formData.set("playlistId", playlistId);
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    startTransition(async () => {
      const result = await submitPlaylistReview({ success: false }, formData);
      if (result.success) {
        toast("Thanks — your review was saved.", "success");
      } else {
        toast(result.error ?? "Failed to save your review.");
      }
    });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "text-text-secondary hover:bg-bg-elevated hover:text-foreground flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        }
      >
        <Star
          className={ownRating ? "text-accent-gamify h-4 w-4" : "h-4 w-4"}
          fill={ownRating ? "currentColor" : "none"}
        />
        Review
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={playlistTitle ? `Review · ${playlistTitle}` : "Review playlist"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === rating}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onClick={() => setRating(star)}
                className="rounded-md p-0.5"
              >
                <Star
                  className={`h-8 w-8 ${star <= rating ? "text-accent-gamify" : "text-text-secondary/40"}`}
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
            rows={3}
            className="border-gold/20 bg-ink text-foreground placeholder:text-text-secondary focus-visible:border-gold w-full rounded-xl border px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={isPending || rating === 0}
            className="from-gold-soft to-gold text-ink w-full rounded-xl bg-linear-to-b py-2.5 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {isPending ? "Saving..." : "Submit review"}
          </button>
        </form>
      </Modal>
    </>
  );
}
