"use client";

import { useState } from "react";
import type { ChapterSpecialVideo } from "@/generated/prisma/client";
import { setChapterSpecialVideoArchived } from "@/actions/content";
import { ArchiveToggleButton } from "@/components/staff/curriculum/toggle-buttons";
import { buttonGhostClass, buttonSecondaryClass } from "@/components/shared/classes";
import { SpecialVideoForm, TAG_LABELS } from "./special-video-forms";

export function SpecialVideoManager({
  chapterId,
  videos,
}: {
  chapterId: string;
  videos: ChapterSpecialVideo[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
        {adding ? (
          <SpecialVideoForm
            chapterId={chapterId}
            onSuccess={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={buttonSecondaryClass}>
            + Add video
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <p className="text-text-secondary text-sm">No special videos added yet.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <VideoRow key={video.id} chapterId={chapterId} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoRow({ chapterId, video }: { chapterId: string; video: ChapterSpecialVideo }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="bg-accent-gamify/10 text-accent-gamify rounded-full px-2 py-0.5 text-[10px] font-medium">
            {TAG_LABELS[video.tag]}
          </span>
          <p className="text-foreground mt-1 truncate font-medium">
            {video.title}
            {video.isArchived && <ArchivedBadge />}
          </p>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary block truncate text-xs underline-offset-4 hover:underline"
          >
            {video.url}
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={video.id}
            isArchived={video.isArchived}
            action={setChapterSpecialVideoArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated mt-4 border-t pt-4">
          <SpecialVideoForm
            chapterId={chapterId}
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
