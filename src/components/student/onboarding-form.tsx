"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import type { ActionState } from "@/lib/prisma-errors";
import {
  inputClass,
  labelClass,
  errorTextClass,
  buttonPrimaryClass,
} from "@/components/shared/classes";

const initialState: ActionState = { success: false };

const LEVEL_OPTIONS = [
  { value: "SSC", label: "SSC" },
  { value: "HSC", label: "HSC" },
];

const GROUP_OPTIONS = [
  { value: "SCIENCE", label: "Science" },
  // { value: "ARTS", label: "Arts" },
  // { value: "COMMERCE", label: "Commerce" },
];

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

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="level" className={labelClass}>
          Level
        </label>
        <select id="level" name="level" required className={inputClass}>
          <option value="">Select level</option>
          {LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.level && <p className={errorTextClass}>{state.fieldErrors.level[0]}</p>}
      </div>

      <div>
        <label htmlFor="group" className={labelClass}>
          Group
        </label>
        <select id="group" name="group" required className={inputClass}>
          <option value="">Select group</option>
          {GROUP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.group && <p className={errorTextClass}>{state.fieldErrors.group[0]}</p>}
      </div>

      <div>
        <label htmlFor="board" className={labelClass}>
          Board <span className="font-normal">(optional)</span>
        </label>
        <select id="board" name="board" className={inputClass}>
          <option value="">Not specified</option>
          {BOARD_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b.charAt(0) + b.slice(1).toLowerCase()}
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
          className={`${inputClass} font-mono`}
        />
        {state.fieldErrors?.phoneNumber && (
          <p className={errorTextClass}>{state.fieldErrors.phoneNumber[0]}</p>
        )}
      </div>

      {state.error && !state.fieldErrors && <p className={errorTextClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimaryClass} w-full py-2.5`}>
        {pending ? "Setting up..." : "Continue"}
      </button>
    </form>
  );
}
