import { StatusView } from "@/components/shared/status-view";

export default function NotFound() {
  return (
    <StatusView
      fullScreen
      code="404"
      title="Page not found"
      message="The page you are looking for doesn't exist or has been moved."
      action={{ label: "Go home", href: "/" }}
    />
  );
}
