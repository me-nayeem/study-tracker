"use client";

import { createChapterTip, updateChapterTip } from "@/actions/content";
import { EntityForm } from "@/components/staff/curriculum/entity-form";
import { inputClass, labelClass, errorTextClass } from "@/components/shared/classes";
import type { ChapterTip } from "@/generated/prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  LAW: "Law (Drive link only)",
  SHORTCUT: "Shortcut Method (YouTube + Drive)",
  CALCULATOR_HACK: "Calculator Hack (YouTube only)",
};

export function TipForm({
  chapterId,
  tip,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  tip?: ChapterTip;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={tip ? updateChapterTip : createChapterTip}
      submitLabel={tip ? "Save changes" : "Add tip"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={tip ? { id: tip.id, chapterId } : { chapterId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" defaultValue={tip?.category ?? "LAW"} className={inputClass}>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {state.fieldErrors?.category && (
              <p className={errorTextClass}>{state.fieldErrors.category[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              defaultValue={tip?.title}
              placeholder="Sine rule derivation"
              className={inputClass}
            />
            {state.fieldErrors?.title && (
              <p className={errorTextClass}>{state.fieldErrors.title[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              YouTube URL <span className="font-normal">(Shortcut / Calculator Hack)</span>
            </label>
            <input
              name="youtubeUrl"
              defaultValue={tip?.youtubeUrl ?? ""}
              placeholder="https://youtube.com/watch?v=..."
              className={inputClass}
            />
            {state.fieldErrors?.youtubeUrl && (
              <p className={errorTextClass}>{state.fieldErrors.youtubeUrl[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Drive link <span className="font-normal">(Law / Shortcut)</span>
            </label>
            <input
              name="driveLink"
              defaultValue={tip?.driveLink ?? ""}
              placeholder="https://drive.google.com/..."
              className={inputClass}
            />
            {state.fieldErrors?.driveLink && (
              <p className={errorTextClass}>{state.fieldErrors.driveLink[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={tip?.order ?? 0}
              className={inputClass}
            />
          </div>
        </>
      )}
    </EntityForm>
  );
}
