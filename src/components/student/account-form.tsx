"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, Lock, Save } from "lucide-react";
import { updateAccount } from "@/actions/account";
import type { ActionState } from "@/lib/prisma-errors";
import { Board } from "@/generated/prisma/enums";
import { buttonGoldClass } from "@/components/shared/classes";

const inputClass =
  "text-foreground placeholder:text-text-secondary focus-visible:border-gold/60 w-full rounded-xl border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm outline-none transition-colors";
const labelClass = "text-foreground mb-1.5 block text-sm font-medium";
const errorTextClass = "text-state-warning mt-1 text-xs";

const initialState: ActionState = { success: false };

const BOARD_OPTIONS = [
  "DHAKA",
  "RAJSHAHI",
  "CUMILLA",
  "JASHORE",
  "CHATTOGRAM",
  "BARISHAL",
  "SYLHET",
  "DINAJPUR",
  "MYMENSINGH",
  "MADRASAH",
  "TECHNICAL",
];

export function AccountForm({
  user,
  profile,
}: {
  user: { name?: string | null; email?: string | null };
  profile: {
    institutionName: string | null;
    phoneNumber: string | null;
    board: Board | null;
  };
}) {
  const [state, formAction, pending] = useActionState(updateAccount, initialState);
  const { update } = useSession();
  const router = useRouter();
  const syncedStateRef = useRef<ActionState | null>(null);

  useEffect(() => {
    if (state.success && state.data?.name && syncedStateRef.current !== state) {
      syncedStateRef.current = state;
      update({ name: state.data.name as string }).then(() => {
        router.refresh();
      });
    }
  }, [state, update, router]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={user.name ?? ""}
          className={inputClass}
        />
        {state.fieldErrors?.name && <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <div className="relative">
          <input
            id="email"
            value={user.email ?? ""}
            disabled
            className={`${inputClass} cursor-not-allowed pr-9 opacity-60`}
          />
          <Lock className="text-text-secondary absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      <div>
        <label htmlFor="board" className={labelClass}>
          Board <span className="text-text-secondary font-normal">(optional)</span>
        </label>
        <select
          id="board"
          name="board"
          defaultValue={profile.board ?? ""}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Not specified</option>
          {BOARD_OPTIONS.map((board) => (
            <option key={board} value={board}>
              {board.charAt(0) + board.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="institutionName" className={labelClass}>
          Institution name
        </label>
        <input
          id="institutionName"
          name="institutionName"
          type="text"
          required
          maxLength={160}
          defaultValue={profile.institutionName ?? ""}
          className={inputClass}
        />
        {state.fieldErrors?.institutionName && (
          <p className={errorTextClass}>{state.fieldErrors.institutionName[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className={labelClass}>
          Phone number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          required
          maxLength={11}
          placeholder="01712345678"
          defaultValue={profile.phoneNumber ?? ""}
          className={`${inputClass} tabular-nums`}
        />
        {state.fieldErrors?.phoneNumber && (
          <p className={errorTextClass}>{state.fieldErrors.phoneNumber[0]}</p>
        )}
      </div>

      <div className="space-y-3 sm:col-span-2">
        {state.error && !state.fieldErrors && <p className={errorTextClass}>{state.error}</p>}

        {state.success && (
          <p className="bg-state-success/10 text-state-success inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Changes saved.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={pending}
            className={`${buttonGoldClass} w-full sm:w-auto`}
          >
            <Save className="h-4 w-4" />
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
