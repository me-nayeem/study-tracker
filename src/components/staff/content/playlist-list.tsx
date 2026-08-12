"use client";

import { useState } from "react";
import type { ChapterPlaylist } from "@/generated/prisma/client";
import { setChapterPlaylistArchived } from "@/actions/content";
import { ArchiveToggleButton } from "@/components/staff/curriculum/toggle-buttons";
import { buttonGhostClass, buttonSecondaryClass } from "@/components/shared/classes";
import { PlaylistForm } from "./playlist-forms";

export function PlaylistManager({
  chapterId,
  playlists,
}: {
  chapterId: string;
  playlists: ChapterPlaylist[];
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

function PlaylistRow({ chapterId, playlist }: { chapterId: string; playlist: ChapterPlaylist }) {
  const [editing, setEditing] = useState(false);

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
