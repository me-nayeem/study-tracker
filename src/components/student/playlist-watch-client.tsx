"use client";

import { useState } from "react";
import type { ChapterPlaylistVideo } from "@/generated/prisma/client";
import { YoutubeEmbed } from "./youtube-embed";
import { extractYoutubeId } from "./youtube-embed";

function extractThumb(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function PlaylistWatchClient({ videos }: { videos: ChapterPlaylistVideo[] }) {
  const [activeId, setActiveId] = useState(videos[0].id);
  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="lg:flex-1">
        <YoutubeEmbed url={active.youtubeUrl} title={active.title} />
        <p className="text-foreground mt-3 font-medium">{active.title}</p>
      </div>

      <div className="flex flex-col gap-2 lg:w-80 lg:shrink-0">
        {videos.map((video) => {
          const thumb = extractThumb(video.youtubeUrl);
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
              <div className="bg-bg-elevated aspect-video w-28 shrink-0 overflow-hidden rounded-md">
                {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
              </div>
              <span
                className={`min-w-0 flex-1 truncate text-sm ${isActive ? "text-accent-primary" : "text-foreground"}`}
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
