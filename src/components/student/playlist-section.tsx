import Link from "next/link";
import { Bell, PlayCircle, Star } from "lucide-react";
import type { StudentPlaylistCard } from "@/lib/content-data";
import { PlaylistReviewPopover } from "./playlist-review-popover";
import { PlaylistComments } from "./playlist-comments";
import { YoutubeIcon } from "../shared/icons/youtube-icon";

const COVER_COLORS = [
  "bg-accent-blue/25",
  "bg-accent-purple/25",
  "bg-accent-red/25",
  "bg-accent-teal/25",
  "bg-accent-gamify/25",
];

export function PlaylistSection({ playlists }: { playlists: StudentPlaylistCard[] }) {
  if (playlists.length === 0) {
    return <p className="text-text-secondary text-sm">No playlists for this chapter yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

function coverFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

function PlaylistCard({ playlist }: { playlist: StudentPlaylistCard }) {
  const cover = coverFor(playlist.id);

  return (
    <div className="bg-bg-surface border-bg-elevated animate-card-in overflow-hidden rounded-2xl border">
      <div className={`flex h-32 items-center justify-center ${cover}`}>
        <YoutubeIcon className="text-foreground/70 h-12 w-12" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-base font-medium">{playlist.title}</p>
            {playlist.channelUrl && (
              <a
                href={playlist.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-primary text-background mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-90"
              >
                <Bell className="h-3.5 w-3.5" />
                Channel
              </a>
            )}
          </div>
          {playlist.reviewCount > 0 && (
            <div className="bg-accent-gamify/10 text-accent-gamify flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5">
              <Star className="h-3 w-3" fill="currentColor" />
              <span className="font-mono text-xs font-semibold">
                {playlist.avgRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <p className="text-text-secondary mt-2 text-xs">{playlist.videoCount} video(s)</p>

        <div className="mt-3 flex items-center gap-2">
          <PlaylistReviewPopover
            playlistId={playlist.id}
            ownRating={playlist.ownRating}
            ownComment={playlist.ownComment}
          />
          <Link
            href={`/playlist/${playlist.id}`}
            className="bg-accent-primary text-background flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <PlayCircle className="h-4 w-4" />
            View
          </Link>
        </div>

        <PlaylistComments comments={playlist.comments} />
      </div>
    </div>
  );
}
