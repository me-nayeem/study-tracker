import Link from "next/link";
import { PlayCircle, Star } from "lucide-react";
import type { PlaylistIndexRow } from "@/lib/content-data";

export function LecturesList({ playlists }: { playlists: PlaylistIndexRow[] }) {
  if (playlists.length === 0) {
    return (
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">No playlists match these filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {playlists.map((p) => (
        <Link
          key={p.id}
          href={`/playlist/${p.id}`}
          className="bg-bg-surface border-bg-elevated hover:border-accent-primary/40 flex items-center gap-3 rounded-xl border p-3 transition-colors"
        >
          <span className="bg-accent-blue/15 text-accent-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <PlayCircle className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">{p.title}</p>
            <p className="text-text-secondary truncate text-xs">
              {p.subjectName} · {p.paperName} · {p.chapterName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {p.reviewCount > 0 && (
              <div className="bg-accent-gamify/10 text-accent-gamify flex items-center gap-1 rounded-full px-2 py-0.5">
                <Star className="h-3 w-3" fill="currentColor" />
                <span className="font-mono text-xs font-semibold">{p.avgRating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-text-secondary text-xs">{p.videoCount} video(s)</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
