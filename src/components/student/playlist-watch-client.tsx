"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { PlaylistWatchVideo } from "@/lib/content-data";
import { toggleVideoProgress } from "@/actions/content";
import { YoutubeEmbed } from "./youtube-embed";
import { extractYoutubeId } from "./youtube-embed";

function extractThumb(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function PlaylistWatchClient({ videos: initialVideos }: { videos: PlaylistWatchVideo[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [activeId, setActiveId] = useState(initialVideos[0].id);
  const [, startTransition] = useTransition();
  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  function handleToggle(videoId: string, next: boolean) {
    setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, completed: next } : v)));

    startTransition(async () => {
      const result = await toggleVideoProgress(videoId, next);
      if (!result.success) {
        setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, completed: !next } : v)));
      }
    });
  }

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
            <div
              key={video.id}
              className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveId(video.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="bg-bg-elevated aspect-video w-28 shrink-0 overflow-hidden rounded-md">
                  {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm ${
                      video.completed
                        ? "text-gray-500"
                        : isActive
                          ? "text-accent-primary"
                          : "text-foreground"
                    }`}
                  >
                    {video.title}
                  </span>
                  {video.completed && (
                    <span className="text-state-success mt-0.5 inline-block text-xs font-medium">
                      Completed
                    </span>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleToggle(video.id, !video.completed)}
                aria-label={video.completed ? "Mark as not completed" : "Mark as completed"}
                className="shrink-0 p-1"
              >
                {video.completed ? (
                  <CheckCircle2 className="text-state-success h-5 w-5" />
                ) : (
                  <Circle className="text-text-secondary h-5 w-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}