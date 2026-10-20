import { StatusView } from "@/components/shared/status-view";

export default function StaffNotFound() {
  return (
    <StatusView
      code="404"
      title="Not found"
      message="This item doesn't exist or has been removed."
      action={{ label: "Back to dashboard", href: "/manager" }}
    />
  );
}
