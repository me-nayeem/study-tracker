"use client";

import { useState } from "react";

export function LevelUpModal({ level, title }: { level: number; title: string | null }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-card-in border-accent-gamify/40 bg-bg-surface w-full max-w-sm rounded-2xl border p-6 text-center"
      >
        <div className="bg-accent-gamify/10 text-accent-gamify mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          🏆
        </div>

        <p className="font-display text-foreground mt-4 text-2xl">Level {level}!</p>

        {title && <p className="text-accent-gamify mt-1 text-sm font-medium">{title}</p>}

        <p className="text-text-secondary mt-3 text-sm">
          You have leveled up. Keep earning points to climb higher.
        </p>

        <button
          onClick={() => setOpen(false)}
          className="bg-accent-primary text-background mt-5 w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Awesome
        </button>
      </div>
    </div>
  );
}
