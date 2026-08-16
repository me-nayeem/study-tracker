"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type PlaylistComment = {
  studentName: string;
  comment: string;
  rating: number;
  isOwn: boolean;
};

const INITIAL_COUNT = 4;
const BATCH_SIZE = 6;

export function PlaylistComments({ comments }: { comments: PlaylistComment[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  if (comments.length === 0) return null;

  const visible = comments.slice(0, visibleCount);
  const hiddenCount = comments.length - visible.length;

  return (
    <div className="border-bg-elevated mt-3 space-y-2 border-t pt-3">
      {visible.map((c, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="bg-bg-elevated text-text-secondary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {c.studentName.charAt(0).toUpperCase()}
          </div>
          <div className="bg-bg-elevated min-w-0 flex-1 rounded-2xl px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <p className="text-foreground truncate text-xs font-semibold">
                {c.studentName}
                {c.isOwn && <span className="text-text-secondary font-normal"> (You)</span>}
              </p>
              <div className="flex shrink-0 items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-2.5 w-2.5 ${
                      star <= c.rating ? "text-accent-gamify" : "text-text-secondary/30"
                    }`}
                    fill={star <= c.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <p className="text-foreground text-sm">{c.comment}</p>
          </div>
        </div>
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setVisibleCount((v) => v + BATCH_SIZE)}
          className="text-text-secondary hover:text-foreground pl-9 text-xs font-medium"
        >
          Load more comments ({hiddenCount} remaining)
        </button>
      )}
    </div>
  );
}
