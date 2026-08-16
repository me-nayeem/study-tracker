"use client";

import { useState } from "react";
import type { ChapterPlaylist, ChapterPlaylistVideo } from "@/generated/prisma/client";
import { setChapterPlaylistArchived, setPlaylistVideoArchived } from "@/actions/content";
import { ArchiveToggleButton } from "@/components/staff/curriculum/toggle-buttons";
import { buttonGhostClass, buttonSecondaryClass } from "@/components/shared/classes";
import { PlaylistForm } from "./playlist-forms";
import { PlaylistVideoForm } from "./playlist-video-forms";

type PlaylistWithVideos = ChapterPlaylist & { videos: ChapterPlaylistVideo[] };

export function PlaylistManager({
  chapterId,
  playlists,
}: {
  chapterId: string;
  playlists: PlaylistWithVideos[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
        {adding ? (
          <PlaylistForm
            chapterId={chapterId}
            onSuccess={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={buttonSecondaryClass}>
            + Add playlist
          </button>
        )}
      </div>

      {playlists.length === 0 ? (
        <p className="text-text-secondary text-sm">No playlists added yet.</p>
      ) : (
        <div className="space-y-3">
          {playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} chapterId={chapterId} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlaylistRow({ chapterId, playlist }: { chapterId: string; playlist: PlaylistWithVideos }) {
  const [editing, setEditing] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">
            {playlist.title}
            {playlist.isArchived && <ArchivedBadge />}
          </p>
          <a
            href={playlist.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary block truncate text-xs underline-offset-4 hover:underline"
          >
            {playlist.youtubeUrl}
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={playlist.id}
            isArchived={playlist.isArchived}
            action={setChapterPlaylistArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated mt-4 border-t pt-4">
          <PlaylistForm
            chapterId={chapterId}
            playlist={playlist}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <div className="border-bg-elevated mt-4 border-t pt-4">
        <h4 className="text-text-secondary mb-3 text-xs font-medium tracking-wide uppercase">
          Videos in this playlist ({playlist.videos.length})
        </h4>

        <div className="space-y-2">
          {playlist.videos.map((video) => (
            <VideoRow key={video.id} playlistId={playlist.id} video={video} />
          ))}
        </div>

        <div className="mt-3">
          {addingVideo ? (
            <PlaylistVideoForm
              playlistId={playlist.id}
              onSuccess={() => setAddingVideo(false)}
              onCancel={() => setAddingVideo(false)}
            />
          ) : (
            <button type="button" onClick={() => setAddingVideo(true)} className={buttonGhostClass}>
              + Add video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoRow({ playlistId, video }: { playlistId: string; video: ChapterPlaylistVideo }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-bg-elevated rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm">
            {video.title}
            {video.isArchived && <ArchivedBadge />}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={video.id}
            isArchived={video.isArchived}
            action={setPlaylistVideoArchived}
          />
        </div>
      </div>
      {editing && (
        <div className="mt-3">
          <PlaylistVideoForm
            playlistId={playlistId}
            video={video}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

function ArchivedBadge() {
  return (
    <span className="bg-state-warning/10 text-state-warning ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-medium">
      Archived
    </span>
  );
}
