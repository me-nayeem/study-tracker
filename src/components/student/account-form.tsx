// "use client";

// import { useActionState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { updateAccount } from "@/actions/account";
// import type { ActionState } from "@/lib/prisma-errors";
// import { Board } from "@/generated/prisma/enums";
// import {
//   inputClass,
//   labelClass,
//   errorTextClass,
//   buttonPrimaryClass,
// } from "@/components/shared/classes";

// const initialState: ActionState = { success: false };

// const BOARD_OPTIONS = [
//   "DHAKA",
//   "RAJSHAHI",
//   "CUMILLA",
//   "JASHORE",
//   "CHATTOGRAM",
//   "BARISHAL",
//   "SYLHET",
//   "DINAJPUR",
//   "MYMENSINGH",
//   "MADRASAH",
//   "TECHNICAL",
// ];

// export function AccountForm({
//   user,
//   profile,
// }: {
//   user: { name?: string | null; email?: string | null };
//   profile: { institutionName: string | null; phoneNumber: string | null; board: Board | null };
// }) {
//   const [state, formAction, pending] = useActionState(updateAccount, initialState);
//   const { update } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (state.success && state.data?.name) {
//       update({ name: state.data.name as string });
//       router.refresh();
//     }
//   }, [state]);

//   return (
//     <form action={formAction} className="space-y-5">
//       <div>
//         <label htmlFor="name" className={labelClass}>
//           Name
//         </label>
//         <input
//           id="name"
//           name="name"
//           type="text"
//           required
//           maxLength={120}
//           defaultValue={user.name ?? ""}
//           className={inputClass}
//         />
//         {state.fieldErrors?.name && <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>}
//       </div>

//       <div>
//         <label htmlFor="email" className={labelClass}>
//           Email
//         </label>
//         <input
//           id="email"
//           value={user.email ?? ""}
//           disabled
//           className={`${inputClass} cursor-not-allowed opacity-60`}
//         />
//       </div>

//       <div>
//         <label htmlFor="board" className={labelClass}>
//           Board <span className="font-normal">(optional)</span>
//         </label>
//         <select id="board" name="board" defaultValue={profile.board ?? ""} className={inputClass}>
//           <option value="">Not specified</option>
//           {BOARD_OPTIONS.map((b) => (
//             <option key={b} value={b}>
//               {b.charAt(0) + b.slice(1).toLowerCase()}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label htmlFor="institutionName" className={labelClass}>
//           Institution name
//         </label>
//         <input
//           id="institutionName"
//           name="institutionName"
//           type="text"
//           required
//           maxLength={160}
//           defaultValue={profile.institutionName ?? ""}
//           className={inputClass}
//         />
//         {state.fieldErrors?.institutionName && (
//           <p className={errorTextClass}>{state.fieldErrors.institutionName[0]}</p>
//         )}
//       </div>

//       <div>
//         <label htmlFor="phoneNumber" className={labelClass}>
//           Phone number
//         </label>
//         <input
//           id="phoneNumber"
//           name="phoneNumber"
//           type="tel"
//           required
//           maxLength={11}
//           placeholder="01712345678"
//           defaultValue={profile.phoneNumber ?? ""}
//           className={`${inputClass} font-mono`}
//         />
//         {state.fieldErrors?.phoneNumber && (
//           <p className={errorTextClass}>{state.fieldErrors.phoneNumber[0]}</p>
//         )}
//       </div>

//       {state.error && !state.fieldErrors && <p className={errorTextClass}>{state.error}</p>}
//       {state.success && <p className="text-state-success text-sm">Saved.</p>}

//       <button type="submit" disabled={pending} className={`${buttonPrimaryClass} w-full py-2.5`}>
//         {pending ? "Saving..." : "Save changes"}
//       </button>
//     </form>
//   );
// }


"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock3 } from "lucide-react";
import { updateAccount } from "@/actions/account";
import type { ActionState } from "@/lib/prisma-errors";
import { Board } from "@/generated/prisma/enums";
import {
  inputClass,
  labelClass,
  errorTextClass,
  buttonPrimaryClass,
} from "@/components/shared/classes";

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

  useEffect(() => {
    if (state.success && state.data?.name) {
      update({ name: state.data.name as string });
      router.refresh();
    }
  }, [state, update, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/30">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Clock3 className="size-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="font-semibold text-sky-950 dark:text-sky-100">
              Profile updates may take a moment
            </h2>
            <p className="mt-1 text-sm leading-6 text-sky-800 dark:text-sky-200">
              After saving your changes, go back to the Dashboard and then return
              to this page. Your updated account information will appear there.
            </p>
          </div>
        </div>
      </div>

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
        {state.fieldErrors?.name && (
          <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          value={user.email ?? ""}
          disabled
          className={`${inputClass} cursor-not-allowed opacity-60`}
        />
      </div>

      <div>
        <label htmlFor="board" className={labelClass}>
          Board <span className="font-normal">(optional)</span>
        </label>
        <select
          id="board"
          name="board"
          defaultValue={profile.board ?? ""}
          className={inputClass}
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
          className={`${inputClass} font-mono`}
        />
        {state.fieldErrors?.phoneNumber && (
          <p className={errorTextClass}>{state.fieldErrors.phoneNumber[0]}</p>
        )}
      </div>

      {state.error && !state.fieldErrors && (
        <p className={errorTextClass}>{state.error}</p>
      )}

      {state.success && (
        <p className="rounded-lg bg-state-success/10 px-3 py-2 text-sm text-state-success">
          Changes saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${buttonPrimaryClass} w-full py-2.5`}
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}