"use client";

import { useActionState, useState } from "react";
import { grantManualPro, revokeManualPro } from "@/actions/subscription";
import type { ActionState } from "@/lib/prisma-errors";
import {
  inputClass,
  labelClass,
  errorTextClass,
  buttonPrimaryClass,
  buttonGhostClass,
} from "@/components/staff/curriculum/classes";

const initialState: ActionState = { success: false };

export function StudentProControl({
  userId,
  isProActive,
}: {
  userId: string;
  isProActive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [grantState, grantAction, grantPending] = useActionState(grantManualPro, initialState);
  const [, revokeAction, revokePending] = useActionState(revokeManualPro, initialState);

  if (!expanded) {
    return (
      <div className="flex justify-end gap-2">
        {isProActive && (
          <form
            action={revokeAction}
            onSubmit={(e) => {
              if (!window.confirm("Revoke this student's Pro access?")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="userId" value={userId} />
            <button type="submit" disabled={revokePending} className={buttonGhostClass}>
              {revokePending ? "Revoking…" : "Revoke Pro"}
            </button>
          </form>
        )}
        <button type="button" onClick={() => setExpanded(true)} className={buttonGhostClass}>
          {isProActive ? "Extend" : "Grant Pro"}
        </button>
      </div>
    );
  }

  return (
    <form action={grantAction} className="border-bg-elevated bg-bg-elevated/40 space-y-2 rounded-lg border p-3">
      <input type="hidden" name="userId" value={userId} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Days</label>
          <input name="days" type="number" min={1} defaultValue={30} className={inputClass} />
          {grantState.fieldErrors?.days && (
            <p className={errorTextClass}>{grantState.fieldErrors.days[0]}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>bKash TrxID (optional)</label>
          <input name="paymentReference" type="text" className={inputClass} />
        </div>
      </div>
      {grantState.error && !grantState.fieldErrors && (
        <p className={errorTextClass}>{grantState.error}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={grantPending} className={buttonPrimaryClass}>
          {grantPending ? "Saving…" : "Confirm grant"}
        </button>
        <button type="button" onClick={() => setExpanded(false)} className={buttonGhostClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}