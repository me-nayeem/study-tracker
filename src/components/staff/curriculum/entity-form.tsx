"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/prisma-errors";
import { buttonPrimaryClass, buttonSecondaryClass } from "./classes";

const initialState: ActionState = { success: false };

export function EntityForm({
  action,
  submitLabel,
  onSuccess,
  onCancel,
  hidden,
  children,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  onSuccess: () => void;
  onCancel?: () => void;
  hidden?: Record<string, string>;
  children: (state: ActionState) => ReactNode;
}) {
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
      {hidden &&
        Object.entries(hidden).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      {children(state)}
      {state.error && !state.fieldErrors && (
        <p className="text-state-warning text-sm">{state.error}</p>
      )}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? "Saving…" : submitLabel}
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
