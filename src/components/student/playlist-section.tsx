"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, PlayCircle, Star } from "lucide-react";
import type { StudentPlaylistCard } from "@/lib/content-data";
import { Modal } from "@/components/shared/modal";
import { YoutubeLogo } from "../shared/icons/youtube-logo";
import { buttonGoldClass, buttonOutlineClass } from "@/components/shared/classes";
import { PlaylistReviewPopover } from "./playlist-review-popover";
import { PlaylistComments } from "./playlist-comments";

export function PlaylistSection({ playlists }: { playlists: StudentPlaylistCard[] }) {
  if (playlists.length === 0) {
    return <p className="text-text-secondary text-sm">No playlists for this chapter yet.</p>;
  }

  return (
    <div className="grid max-w-6xl grid-cols-1 gap-x-4 gap-y-7 pt-2 pb-4 sm:grid-cols-2 sm:gap-y-8 xl:grid-cols-3">
      {playlists.map((playlist, index) => (
        <PlaylistCard key={playlist.id} playlist={playlist} index={index} />
      ))}
    </div>
  );
}

function PlaylistCard({ playlist, index }: { playlist: StudentPlaylistCard; index: number }) {
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const hasRating = playlist.reviewCount > 0;
  const commentCount = playlist.comments.length;

  return (
    <div
      className="subject-card"
      style={{ "--float-delay": `${-(index % 4) * 1.3}s` } as React.CSSProperties}
    >
      <div className="subject-card-float">
        <div>
          <div className="subject-card-face subject-card-face--panel">
            <div className="subject-card-inner @container flex flex-col p-1.5">
              {/* artwork panel: rating + channel link on top of the YouTube logo */}
              <div className="card-well relative flex h-28 items-center justify-center rounded-[0.95rem] @min-[300px]:h-32">
                <YoutubeLogo className="w-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] @min-[300px]:w-28" />
                <span className="text-foreground/85 absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                  <Star className="text-gold h-3 w-3" fill="currentColor" />
                  {hasRating
                    ? `${playlist.avgRating.toFixed(1)} · ${playlist.reviewCount} rated`
                    : "No ratings"}
                </span>
                {playlist.channelUrl && (
                  <a
                    href={playlist.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open YouTube channel"
                    title="YouTube channel"
                    className="text-foreground/80 hover:text-foreground absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-colors hover:bg-black/60"
                  >
                    <Bell className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* title + meta */}
              <div className="px-2 pt-3 @min-[300px]:px-2.5">
                <p className="text-foreground text-sm leading-snug font-semibold @min-[300px]:text-base">
                  {playlist.title}
                </p>
                <p className="text-text-secondary mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                  <span>
                    {playlist.videoCount} {playlist.videoCount === 1 ? "video" : "videos"}
                  </span>
                  {commentCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setReviewsOpen(true)}
                      className="hover:text-foreground inline-flex items-center gap-1 underline-offset-2 transition-colors hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {commentCount} {commentCount === 1 ? "review" : "reviews"}
                    </button>
                  )}
                </p>
              </div>

              {/* actions */}
              <div className="mt-3 grid grid-cols-2 gap-2 px-1 pb-1">
                <PlaylistReviewPopover
                  playlistId={playlist.id}
                  playlistTitle={playlist.title}
                  ownRating={playlist.ownRating}
                  ownComment={playlist.ownComment}
                  triggerClassName={`${buttonOutlineClass} w-full [&_svg]:h-3.5 [&_svg]:w-3.5`}
                />
                <Link href={`/playlist/${playlist.id}`} className={`${buttonGoldClass} w-full`}>
                  <PlayCircle className="h-4 w-4" />
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        title={`Reviews · ${playlist.title}`}
        size="md"
      >
        <PlaylistComments comments={playlist.comments} />
      </Modal>
    </div>
  );
}
