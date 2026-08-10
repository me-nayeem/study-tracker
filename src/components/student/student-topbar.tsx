export function StudentTopbar({
  name,
  email,
  onMenuClick,
}: {
  name?: string | null;
  email?: string | null;
  onMenuClick: () => void;
}) {
  return (
    <header className="border-bg-elevated bg-bg-surface/60 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <button
        onClick={onMenuClick}
        className="text-foreground -ml-2 p-2 md:hidden"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
          <path
            d="M3 6h14M3 10h14M3 14h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="min-w-0 text-right">
        <p className="text-foreground truncate text-sm font-medium">{name ?? email}</p>
        <p className="text-text-secondary text-xs">Student</p>
      </div>
    </header>
  );
}
