"use client";

import { createChapterPlaylist, updateChapterPlaylist } from "@/actions/content";
import { EntityForm } from "@/components/staff/curriculum/entity-form";
import { inputClass, labelClass, errorTextClass } from "@/components/shared/classes";
import type { ChapterPlaylist } from "@/generated/prisma/client";

export function PlaylistForm({
  chapterId,
  playlist,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  playlist?: ChapterPlaylist;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={playlist ? updateChapterPlaylist : createChapterPlaylist}
      submitLabel={playlist ? "Save changes" : "Add playlist"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={playlist ? { id: playlist.id, chapterId } : { chapterId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              defaultValue={playlist?.title}
              placeholder="Full chapter playlist"
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
              defaultValue={playlist?.youtubeUrl}
              placeholder="https://youtube.com/playlist?list=..."
              className={inputClass}
            />
            {state.fieldErrors?.youtubeUrl && (
              <p className={errorTextClass}>{state.fieldErrors.youtubeUrl[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Channel URL <span className="font-normal">(optional)</span>
            </label>
            <input
              name="channelUrl"
              defaultValue={playlist?.channelUrl ?? ""}
              placeholder="https://youtube.com/@channelname"
              className={inputClass}
            />
            {state.fieldErrors?.channelUrl && (
              <p className={errorTextClass}>{state.fieldErrors.channelUrl[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={playlist?.order ?? 0}
              className={inputClass}
            />
          </div>
        </>
      )}
    </EntityForm>
  );
}
