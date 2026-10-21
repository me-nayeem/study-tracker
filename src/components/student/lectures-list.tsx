import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { PlaylistIndexRow } from "@/lib/content-data";
import { YoutubeLogo } from "@/components/shared/icons/youtube-logo";

export function LecturesList({ playlists }: { playlists: PlaylistIndexRow[] }) {
  if (playlists.length === 0) {
    return (
      <div className="card-surface px-6 py-12 text-center">
        <p className="text-3xl" aria-hidden="true">
          🔍
        </p>
        <p className="font-display text-foreground mt-2 text-lg">No playlists found</p>
        <p className="text-text-secondary mt-1 text-sm">Try another search or clear the filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 pb-4 lg:grid-cols-2">
      {playlists.map((p, index) => (
        <Link
          key={p.id}
          href={`/playlist/${p.id}`}
          className="subject-card subject-card--row block rounded-[1.25rem]"
          style={{ "--float-delay": `${-(index % 5) * 1.1}s` } as React.CSSProperties}
        >
          <div className="subject-card-float">
            <div className="subject-card-face subject-card-face--panel">
              <div className="subject-card-inner flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
                <span className="card-well flex h-12 w-14 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-16">
                  <YoutubeLogo className="w-9 sm:w-10" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm leading-snug font-semibold sm:text-base">
                    {p.title}
                  </p>
                  <p className="text-text-secondary mt-0.5 truncate text-xs">
                    {p.subjectName} · <span className="capitalize">{p.paperName}</span> ·{" "}
                    {p.chapterName}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-foreground/70 rounded-full bg-white/6 px-2 py-0.5 text-[11px] font-medium">
                      {p.videoCount} {p.videoCount === 1 ? "video" : "videos"}
                    </span>
                    {p.reviewCount > 0 && (
                      <span className="bg-gold/10 text-gold inline-flex items-center gap-1 rounded-full px-2 py-0.5">
                        <Star className="h-3 w-3" fill="currentColor" />
                        <span className="text-[11px] font-semibold tabular-nums">
                          {p.avgRating.toFixed(1)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="text-foreground/40 h-5 w-5 shrink-0" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
