"use client";

import { createPlaylistVideo, updatePlaylistVideo } from "@/actions/content";
import { EntityForm } from "@/components/staff/curriculum/entity-form";
import { inputClass, labelClass, errorTextClass } from "@/components/shared/classes";
import type { ChapterPlaylistVideo } from "@/generated/prisma/client";

export function PlaylistVideoForm({
  playlistId,
  video,
  onSuccess,
  onCancel,
}: {
  playlistId: string;
  video?: ChapterPlaylistVideo;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={video ? updatePlaylistVideo : createPlaylistVideo}
      submitLabel={video ? "Save changes" : "Add video"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={video ? { id: video.id, playlistId } : { playlistId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              defaultValue={video?.title}
              placeholder="Video 1 — Introduction"
              className={inputClass}
            />
            {state.fieldErrors?.title && (
              <p className={errorTextClass}>{state.fieldErrors.title[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>YouTube URL</label>
            <input
              name="youtubeUrl"
              defaultValue={video?.youtubeUrl}
              placeholder="https://youtube.com/watch?v=..."
              className={inputClass}
            />
            {state.fieldErrors?.youtubeUrl && (
              <p className={errorTextClass}>{state.fieldErrors.youtubeUrl[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={video?.order ?? 0}
              className={inputClass}
            />
          </div>
        </>
      )}
    </EntityForm>
  );
}
