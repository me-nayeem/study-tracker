/** Thin solid-gold progress bar. */
export function ProgressBar({
  percent,
  className = "h-1",
}: {
  percent: number;
  /** height and any layout classes */
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden rounded-full bg-white/8 ${className}`}>
      <span
        className="bg-gold block h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </span>
  );
}
