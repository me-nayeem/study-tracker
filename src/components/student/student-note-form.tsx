"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStudentNote, updateStudentNote } from "@/actions/student-notes";
import type { ActionState } from "@/lib/prisma-errors";
import {
  inputClass,
  labelClass,
  errorTextClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/components/shared/classes";
import type { StudentNoteOwnerRow } from "@/lib/content-data";

const initialState: ActionState = { success: false };

export function StudentNoteForm({
  chapterId,
  note,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  note?: StudentNoteOwnerRow;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const action = note ? updateStudentNote : createStudentNote;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {note ? (
        <input type="hidden" name="id" value={note.id} />
      ) : (
        <input type="hidden" name="chapterId" value={chapterId} />
      )}

      <div>
        <label className={labelClass}>Title</label>
        <input
          name="title"
          defaultValue={note?.title}
          placeholder="My chapter summary"
          className={inputClass}
        />
        {state.fieldErrors?.title && <p className={errorTextClass}>{state.fieldErrors.title[0]}</p>}
      </div>

      <div>
        <label className={labelClass}>Google Drive link</label>
        <input
          name="fileUrl"
          defaultValue={note?.fileUrl}
          placeholder="https://drive.google.com/..."
          className={inputClass}
        />
        {state.fieldErrors?.fileUrl && (
          <p className={errorTextClass}>{state.fieldErrors.fileUrl[0]}</p>
        )}
        <p className="text-text-secondary mt-1 text-xs">
          Sharing must be set to "Anyone with the link", or others won't be able to open it.
        </p>
      </div>

      {!note && (
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name="isPublic"
            value="true"
            className="accent-accent-primary h-4 w-4 rounded"
          />
          Make public once approved
        </label>
      )}

      {state.error && !state.fieldErrors && <p className={errorTextClass}>{state.error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? "Saving…" : note ? "Save changes" : "Add note"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className={buttonSecondaryClass}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
