"use client";

import { useState, useTransition } from "react";
import { Heart, Star, ExternalLink, FileText } from "lucide-react";
import { toggleStudentNoteLike, rateStudentNote } from "@/actions/student-notes";
import type { PublicNoteFeedItem } from "@/lib/content-data";
import { NoteComments } from "./note-comments";

const COVER_COLORS = [
  "bg-accent-blue/25",
  "bg-accent-purple/25",
  "bg-accent-red/25",
  "bg-accent-teal/25",
  "bg-accent-gamify/25",
];

function coverFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

const AVATAR_COLORS = [
  "bg-accent-primary/20 text-accent-primary",
  "bg-accent-gamify/20 text-accent-gamify",
  "bg-state-success/20 text-state-success",
  "bg-state-premium/20 text-state-premium",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function RatePopover({
  note,
  onRate,
  isPending,
  displayRating,
}: {
  note: PublicNoteFeedItem;
  onRate: (rating: number) => void;
  isPending: boolean;
  displayRating: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending || note.isOwn}
        className="text-text-secondary hover:bg-bg-elevated hover:text-foreground flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40"
      >
        <Star
          className={displayRating > 0 ? "text-accent-gamify h-4 w-4" : "h-4 w-4"}
          fill={displayRating > 0 ? "currentColor" : "none"}
        />
        Rate
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-elevated border-bg-surface flex gap-1 rounded-lg border p-4 shadow-xl"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  onRate(star);
                  setOpen(false);
                }}
                className="p-0.5"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= displayRating ? "text-accent-gamify" : "text-text-secondary/40"
                  }`}
                  fill={star <= displayRating ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function NoteFeedCard({ note }: { note: PublicNoteFeedItem }) {
  const [isPending, startTransition] = useTransition();
  const cover = coverFor(note.id);
  const avatarClass = colorFor(note.studentName);

  function handleLike() {
    const formData = new FormData();
    formData.set("id", note.id);
    startTransition(() => {
      toggleStudentNoteLike({ success: false }, formData);
    });
  }

  function handleRate(rating: number) {
    const formData = new FormData();
    formData.set("id", note.id);
    formData.set("rating", String(rating));
    startTransition(() => {
      rateStudentNote({ success: false }, formData);
    });
  }

  const displayRating = note.ownRating ?? Math.round(note.avgRating);

  return (
    <div className="bg-bg-surface border-bg-elevated animate-card-in overflow-hidden rounded-2xl border">
      <div className={`flex h-28 items-center justify-center ${cover}`}>
        <FileText className="text-foreground/70 h-10 w-10" />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ${avatarClass}`}
          >
            {note.studentName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-semibold">{note.studentName}</p>
            <p className="text-text-secondary truncate text-xs">{note.chapterName}</p>
          </div>
          {note.ratingCount > 0 && (
            <div className="bg-accent-gamify/10 text-accent-gamify flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1">
              <Star className="h-3 w-3" fill="currentColor" />
              <span className="font-mono text-xs font-semibold">{note.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-foreground mt-3 text-sm leading-relaxed">{note.title}</p>

        <div className="border-bg-elevated mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <button
            type="button"
            onClick={handleLike}
            disabled={isPending || note.isOwn}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
              note.likedByViewer
                ? "bg-state-warning/10 text-state-warning"
                : "text-text-secondary hover:bg-bg-elevated hover:text-foreground"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-transform ${note.likedByViewer ? "scale-110" : ""}`}
              fill={note.likedByViewer ? "currentColor" : "none"}
            />
            {note.likeCount > 0 ? note.likeCount : "Like"}
          </button>

          <RatePopover
            note={note}
            onRate={handleRate}
            isPending={isPending}
            displayRating={displayRating}
          />

          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:bg-bg-elevated flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View
          </a>
        </div>
      </div>

      <NoteComments noteId={note.id} comments={note.comments} />
    </div>
  );
}
