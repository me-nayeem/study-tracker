"use client";

import { useTransition } from "react";
import { deleteTopic } from "@/actions/curriculum";
import type { ActionState } from "@/lib/prisma-errors";
import { buttonGhostClass } from "./classes";

export function ArchiveToggleButton({
  id,
  isArchived,
  action,
}: {
  id: string;
  isArchived: boolean;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("isArchived", String(!isArchived));
    startTransition(async () => {
      const result = await action({ success: false }, formData);
      if (!result.success) {
        alert(result.error ?? "Failed to update.");
      }
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={buttonGhostClass}>
      {isPending ? "…" : isArchived ? "Restore" : "Archive"}
    </button>
  );
}

export function DeleteTopicButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this topic? This cannot be undone.")) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await deleteTopic({ success: false }, formData);
      if (!result.success) {
        alert(result.error ?? "Failed to delete topic.");
      }
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={buttonGhostClass}>
      {isPending ? "…" : "Delete"}
    </button>
  );
}
