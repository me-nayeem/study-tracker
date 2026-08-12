"use client";

import { useState, useTransition } from "react";
import { submitPlaylistReview } from "@/actions/content";
import { buttonPrimaryClass } from "@/components/shared/classes";
import type { ChapterPlaylist } from "@/generated/prisma/client";
import type { PlaylistReviewLite } from "@/lib/content-data";

export function PlaylistSection({
  playlists,
  reviewByPlaylistId,
}: {
  playlists: ChapterPlaylist[];
  reviewByPlaylistId: Map<string, PlaylistReviewLite>;
}) {
  if (playlists.length === 0) {
    return <p className="text-text-secondary text-sm">No playlists added for this chapter yet.</p>;
  }

  return (
    <div className="space-y-3">
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          initialReview={reviewByPlaylistId.get(playlist.id) ?? null}
        />
      ))}
    </div>
  );
}

function PlaylistCard({
  playlist,
  initialReview,
}: {
  playlist: ChapterPlaylist;
  initialReview: PlaylistReviewLite | null;
}) {
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [saved, setSaved] = useState(initialReview !== null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit() {
    if (rating < 1) {
      setError("Pick a rating first.");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.set("playlistId", playlist.id);
    formData.set("rating", String(rating));
    formData.set("comment", comment);

    startTransition(async () => {
      const result = await submitPlaylistReview({ success: false }, formData);
      if (!result.success) {
        setError(result.error ?? "Failed to save review.");
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-medium">{playlist.title}</p>
        <a
          href={playlist.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-primary text-xs underline-offset-4 hover:underline"
        >
          Open
        </a>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star);
              setSaved(false);
            }}
            disabled={isPending}
            aria-label={`Rate ${star} stars`}
            className={`text-lg leading-none ${
              star <= rating ? "text-accent-gamify" : "text-text-secondary/40"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          setSaved(false);
        }}
        disabled={isPending}
        maxLength={1000}
        placeholder="Optional comment..."
        rows={2}
        className="border-bg-elevated bg-background text-foreground focus-visible:border-accent-primary mt-3 w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none"
      />

      {error && <p className="text-state-warning mt-1.5 text-xs">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className={buttonPrimaryClass}
        >
          {isPending ? "Saving..." : saved ? "Update review" : "Submit review"}
        </button>
        {saved && !isPending && <span className="text-state-success text-xs">Saved</span>}
      </div>
    </div>
  );
}
