"use client";

import { createOfficialNote, updateOfficialNote } from "@/actions/content";
import { EntityForm } from "@/components/staff/curriculum/entity-form";
import { inputClass, labelClass, errorTextClass } from "@/components/shared/classes";
import { AccessType } from "@/generated/prisma/enums";
import type { OfficialNote } from "@/generated/prisma/client";

const ACCESS_LABELS: Record<AccessType, string> = {
  FREE: "Free",
  SUBSCRIPTION: "Subscription (Pro)",
  BATCH_PURCHASE: "Batch purchase (Pro)",
};

export function OfficialNoteForm({
  chapterId,
  note,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  note?: OfficialNote;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={note ? updateOfficialNote : createOfficialNote}
      submitLabel={note ? "Save changes" : "Add note"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={note ? { id: note.id, chapterId } : { chapterId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Title</label>
            <input
              name="title"
              defaultValue={note?.title}
              placeholder="Chapter summary notes"
              className={inputClass}
            />
            {state.fieldErrors?.title && (
              <p className={errorTextClass}>{state.fieldErrors.title[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>File URL</label>
            <input
              name="fileUrl"
              defaultValue={note?.fileUrl}
              placeholder="https://..."
              className={inputClass}
            />
            {state.fieldErrors?.fileUrl && (
              <p className={errorTextClass}>{state.fieldErrors.fileUrl[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Access</label>
            <select
              name="accessType"
              defaultValue={note?.accessType ?? AccessType.SUBSCRIPTION}
              className={inputClass}
            >
              {Object.values(AccessType).map((a) => (
                <option key={a} value={a}>
                  {ACCESS_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={note?.order ?? 0}
              className={inputClass}
            />
          </div>
        </>
      )}
    </EntityForm>
  );
}

export { ACCESS_LABELS };
