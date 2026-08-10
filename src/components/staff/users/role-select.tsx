"use client";

import { useState, useTransition } from "react";
import { changeUserRole } from "@/actions/users";
import { Role } from "@/generated/prisma/enums";
import { inputClass } from "@/components/staff/curriculum/classes";

export function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: Role;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<Role>(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleChange(newRole: Role) {
    if (newRole === value) return;
    if (!confirm(`Change this user's role from ${value} to ${newRole}?`)) return;

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("newRole", newRole);

    startTransition(async () => {
      const result = await changeUserRole({ success: false }, formData);
      if (!result.success) {
        alert(result.error ?? "Failed to change role.");
        return;
      }
      setValue(newRole);
    });
  }

  return (
    <select
      value={value}
      disabled={disabled || isPending}
      onChange={(e) => handleChange(e.target.value as Role)}
      className={`${inputClass} w-auto py-1.5 text-xs disabled:opacity-50`}
    >
      {Object.values(Role).map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
