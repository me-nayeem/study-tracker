"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, PlayCircle, Star } from "lucide-react";
import type { StudentPlaylistCard } from "@/lib/content-data";
import { Modal } from "@/components/shared/modal";
import { YoutubeLogo } from "../shared/icons/youtube-logo";
import { PlaylistReviewPopover } from "./playlist-review-popover";
import { PlaylistComments } from "./playlist-comments";

const YOUTUBE_ACCENT = "#ff3b30";

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
      style={
        {
          "--card-accent": YOUTUBE_ACCENT,
          "--float-delay": `${-(index % 4) * 1.3}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div>
          <div className="subject-card-face subject-card-face--panel">
            <div className="subject-card-inner @container flex flex-col p-3 @min-[220px]:p-4">
              {/* header: channel emblem + rating */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                {playlist.channelUrl ? (
                  <a
                    href={playlist.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open YouTube channel"
                    title="YouTube channel"
                    className="from-gold-soft via-gold to-gold-deep flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br p-[1.5px] shadow-md @min-[220px]:h-9 @min-[220px]:w-9"
                  >
                    <span className="bg-ink flex h-full w-full items-center justify-center rounded-full text-(--card-accent)">
                      <Bell className="h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <span />
                )}
                <span className="flex flex-col items-end leading-none">
                  <span className="gold-text font-display flex items-center gap-0.5 text-xl font-semibold @min-[220px]:text-2xl">
                    {hasRating ? playlist.avgRating.toFixed(1) : "—"}
                    <Star className="text-gold h-3.5 w-3.5" fill="currentColor" />
                  </span>
                  <span className="text-gold-soft/60 mt-1 text-[8px] font-medium tracking-[0.2em] uppercase @min-[220px]:text-[9px]">
                    {hasRating ? `${playlist.reviewCount} rated` : "No ratings"}
                  </span>
                </span>
              </div>

              {/* artwork */}
              <div className="relative my-3 flex h-24 items-center justify-center @min-[300px]:h-28">
                <span className="absolute h-24 w-24 rounded-full bg-(--card-accent) opacity-20 blur-2xl" />
                <YoutubeLogo className="relative w-28 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] @min-[300px]:w-32" />
              </div>

              {/* title + meta */}
              <div className="relative z-10 text-center">
                <p className="gold-text font-display text-base leading-snug font-semibold uppercase @min-[300px]:text-lg">
                  {playlist.title}
                </p>
                <p className="text-gold-soft/60 mt-1 text-[8px] font-medium tracking-[0.22em] uppercase @min-[220px]:text-[10px]">
                  {playlist.videoCount} {playlist.videoCount === 1 ? "video" : "videos"}
                </p>
                {commentCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setReviewsOpen(true)}
                    className="text-text-secondary hover:text-gold-soft mt-1 inline-flex items-center gap-1 text-[10px] font-medium transition-colors @min-[220px]:text-xs"
                  >
                    <MessageCircle className="h-3 w-3" />
                    {commentCount} {commentCount === 1 ? "review" : "reviews"}
                  </button>
                )}
              </div>

              {/* actions */}
              <div className="relative z-10 mt-2 grid grid-cols-2 gap-1.5 @min-[220px]:mt-3 @min-[220px]:gap-2">
                <PlaylistReviewPopover
                  playlistId={playlist.id}
                  playlistTitle={playlist.title}
                  ownRating={playlist.ownRating}
                  ownComment={playlist.ownComment}
                  triggerClassName="border-gold/40 text-gold-soft hover:border-gold flex items-center justify-center gap-1 rounded-lg border bg-black/40 px-1 py-1.5 text-[11px] font-semibold transition-colors @min-[220px]:py-2 @min-[220px]:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5"
                />
                <Link
                  href={`/playlist/${playlist.id}`}
                  className="from-gold-soft to-gold text-ink flex items-center justify-center gap-1 rounded-lg bg-linear-to-b px-1 py-1.5 text-[11px] font-semibold transition-transform active:scale-[0.98] @min-[220px]:py-2 @min-[220px]:text-sm"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  View
                </Link>
              </div>

              <span className="subject-card-sheen" />
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
