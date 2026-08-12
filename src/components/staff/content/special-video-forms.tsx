"use client";

import { createChapterSpecialVideo, updateChapterSpecialVideo } from "@/actions/content";
import { EntityForm } from "@/components/staff/curriculum/entity-form";
import { inputClass, labelClass, errorTextClass } from "@/components/shared/classes";
import { SpecialVideoTag } from "@/generated/prisma/enums";
import type { ChapterSpecialVideo } from "@/generated/prisma/client";

const TAG_LABELS: Record<SpecialVideoTag, string> = {
  ONE_SHOT: "One-shot",
  ADMISSION: "Admission",
  MOTIVATION: "Motivation",
  TRICK: "Trick",
  OTHER: "Other",
};

export function SpecialVideoForm({
  chapterId,
  video,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  video?: ChapterSpecialVideo;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={video ? updateChapterSpecialVideo : createChapterSpecialVideo}
      submitLabel={video ? "Save changes" : "Add video"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={video ? { id: video.id, chapterId } : { chapterId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Tag</label>
            <select
              name="tag"
              defaultValue={video?.tag ?? SpecialVideoTag.ONE_SHOT}
              className={inputClass}
            >
              {Object.values(SpecialVideoTag).map((t) => (
                <option key={t} value={t}>
                  {TAG_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              defaultValue={video?.title}
              placeholder="Full chapter in 10 minutes"
              className={inputClass}
            />
            {state.fieldErrors?.title && (
              <p className={errorTextClass}>{state.fieldErrors.title[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Video URL</label>
            <input
              name="url"
              defaultValue={video?.url}
              placeholder="https://..."
              className={inputClass}
            />
            {state.fieldErrors?.url && <p className={errorTextClass}>{state.fieldErrors.url[0]}</p>}
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

export { TAG_LABELS };
