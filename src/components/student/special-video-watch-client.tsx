"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { ChapterSpecialVideo } from "@/generated/prisma/client";
import { YoutubeEmbed, extractYoutubeId, isYoutubeUrl } from "./youtube-embed";

function extractThumb(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function SpecialVideoWatchClient({
  videos,
  initialVideoId,
}: {
  videos: ChapterSpecialVideo[];
  initialVideoId: string;
}) {
  const [activeId, setActiveId] = useState(initialVideoId);
  const active = videos.find((v) => v.id === activeId) ?? videos[0];
  const activeIsYoutube = isYoutubeUrl(active.url);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="lg:flex-1">
        {activeIsYoutube ? (
          <YoutubeEmbed url={active.url} title={active.title} />
        ) : (
          <div className="bg-bg-elevated flex aspect-video flex-col items-center justify-center gap-3 rounded-lg">
            <p className="text-text-secondary text-sm">This video can not be played inline.</p>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-primary text-background flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Open link <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
        <p className="text-foreground mt-3 font-medium">{active.title}</p>
      </div>

      <div className="flex flex-col gap-2 lg:w-80 lg:shrink-0">
        {videos.map((video) => {
          const thumb = extractThumb(video.url);
          const isActive = video.id === active.id;
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => setActiveId(video.id)}
              className={`flex items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
              }`}
            >
              <div className="bg-bg-elevated flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-md">
                {thumb ? (
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ExternalLink className="text-text-secondary h-4 w-4" />
                )}
              </div>
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  isActive ? "text-accent-primary" : "text-foreground"
                }`}
              >
                {video.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
