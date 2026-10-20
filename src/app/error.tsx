"use client";

import { StatusView } from "@/components/shared/status-view";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <StatusView
      fullScreen
      title="Something went wrong"
      message="An unexpected error occurred. Please try again."
      action={{ label: "Try again", onClick: retry }}
    />
  );
}
