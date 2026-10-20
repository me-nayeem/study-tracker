import Link from "next/link";

export function StatusView({
  code,
  title,
  message,
  action,
  fullScreen = false,
}: {
  code?: string;
  title: string;
  message: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
  fullScreen?: boolean;
}) {
  const actionClass =
    "bg-accent-primary text-background mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90";

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${
        fullScreen ? "bg-background min-h-screen" : "py-20"
      }`}
    >
      {code && <p className="text-accent-primary font-mono text-sm font-medium">{code}</p>}
      <h1 className="font-display text-foreground mt-2 text-2xl md:text-3xl">{title}</h1>
      <p className="text-text-secondary mt-2 max-w-sm text-sm">{message}</p>
      {action &&
        ("href" in action ? (
          <Link href={action.href} className={actionClass}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={actionClass}>
            {action.label}
          </button>
        ))}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="Loading">
      <span className="border-bg-elevated border-t-accent-primary h-8 w-8 animate-spin rounded-full border-2" />
    </div>
  );
}
