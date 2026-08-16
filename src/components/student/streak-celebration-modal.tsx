"use client";

import { useState } from "react";

const MESSAGES = [
  "Keep studying, keep growing.",
  "You are building something real.",
  "Consistency beats intensity. Nice work.",
  "Be Consistance.",
  "Keep Pushing Yourself.",
];

export function StreakCelebrationModal({
  streakCount,
  pointsAwarded,
}: {
  streakCount: number;
  pointsAwarded: number;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const message = MESSAGES[streakCount % MESSAGES.length];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-card-in border-bg-elevated bg-bg-surface w-full max-w-sm rounded-2xl border p-6 text-center"
      >
        <div className="bg-accent-gamify/10 text-accent-gamify mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          🔥
        </div>

        <p className="font-display text-foreground mt-4 text-2xl">
          {streakCount} day{streakCount === 1 ? "" : "s"} streak!
        </p>

        {pointsAwarded > 0 && (
          <p className="text-accent-gamify mt-1 font-mono text-sm">+{pointsAwarded} points</p>
        )}

        <p className="text-text-secondary mt-3 text-sm">{message}</p>

        <button
          onClick={() => setOpen(false)}
          className="bg-accent-primary text-background mt-5 w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
