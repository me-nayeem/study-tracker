"use client";

import { useTransition } from "react";
import { markChapterComplete } from "@/actions/chapter-mastery";
import { buttonPrimaryClass } from "@/components/shared/classes";

export function MarkCompleteButton({ chapterId }: { chapterId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Mark this chapter complete? A quiz will follow soon.")) return;

    const formData = new FormData();
    formData.set("chapterId", chapterId);

    startTransition(async () => {
      const result = await markChapterComplete({ success: false }, formData);
      if (!result.success) {
        alert(result.error ?? "Failed to mark complete.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${buttonPrimaryClass} w-full sm:w-auto`}
    >
      {isPending ? "Submitting..." : "Mark chapter complete"}
    </button>
  );
}