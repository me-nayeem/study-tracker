"use client";

import { StatusView } from "@/components/shared/status-view";

export default function StaffError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <StatusView
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      action={{ label: "Try again", onClick: retry }}
    />
  );
}
