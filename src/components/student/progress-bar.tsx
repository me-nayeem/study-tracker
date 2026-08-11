export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="bg-bg-elevated h-1.5 w-full overflow-hidden rounded-full">
      <div
        className="bg-accent-primary h-full rounded-full transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
