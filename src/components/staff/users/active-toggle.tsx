"use client";

import { useTransition } from "react";
import { setUserActive } from "@/actions/users";
import { buttonGhostClass } from "@/components/staff/curriculum/classes";

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

  function handleClick() {
    const next = !isActive;
    if (!next && !confirm("Deactivate this user? They won't be able to sign in.")) return;

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("isActive", String(next));

    startTransition(async () => {
      const result = await setUserActive({ success: false }, formData);
      if (!result.success) {
        alert(result.error ?? "Failed to update.");
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
