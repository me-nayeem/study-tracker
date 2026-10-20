"use client";

import { useTransition } from "react";
import { markChapterComplete } from "@/actions/chapter-mastery";
import { CheckCheck } from "lucide-react";
import { buttonGoldClass } from "@/components/shared/classes";
import { useConfirm, useToast } from "@/components/shared/dialog-provider";

export function MarkCompleteButton({ chapterId }: { chapterId: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  async function handleClick() {
    const ok = await confirm({
      title: "Mark this chapter complete?",
      message: "A quiz will follow soon.",
      confirmLabel: "Mark complete",
    });
    if (!ok) return;

    const formData = new FormData();
    formData.set("chapterId", chapterId);

    startTransition(async () => {
      const result = await markChapterComplete({ success: false }, formData);
      if (!result.success) {
        toast(result.error ?? "Failed to mark complete.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${buttonGoldClass} w-full sm:w-auto`}
    >
      <CheckCheck className="h-4 w-4" />
      {isPending ? "Submitting..." : "Mark chapter complete"}
    </button>
  );
}
