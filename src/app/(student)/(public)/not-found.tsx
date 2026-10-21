import { StatusView } from "@/components/shared/status-view";

export default function StudentNotFound() {
  return (
    <StatusView
      code="404"
      title="Not found"
      message="This page doesn't exist or isn't part of your track."
      action={{ label: "Back to dashboard", href: "/dashboard" }}
    />
  );
}
