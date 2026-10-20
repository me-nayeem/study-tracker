"use client";

import { useTransition } from "react";
import { setUserActive } from "@/actions/users";
import { buttonGhostClass } from "@/components/staff/curriculum/classes";
import { useConfirm, useToast } from "@/components/shared/dialog-provider";

export function ActiveToggle({
  userId,
  isActive,
  disabled,
}: {
  userId: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  async function handleClick() {
    const next = !isActive;
    if (
      !next &&
      !(await confirm({
        title: "Deactivate this user?",
        message: "They won't be able to sign in.",
        confirmLabel: "Deactivate",
        destructive: true,
      }))
    ) {
      return;
    }

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("isActive", String(next));

    startTransition(async () => {
      const result = await setUserActive({ success: false }, formData);
      if (!result.success) {
        toast(result.error ?? "Failed to update.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={buttonGhostClass}
    >
      {isPending ? "…" : isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
