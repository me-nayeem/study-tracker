export function StatsHeader({
  totalPoints,
  level,
  streakCount,
}: {
  totalPoints: number;
  level: number;
  streakCount: number;
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <StatCard label="Level" value={level} accentClass="text-accent-gamify" />
      <StatCard label="Points" value={totalPoints} accentClass="text-accent-gamify" />
      <StatCard label="Streak" value={`${streakCount}d`} accentClass="text-state-success"/>
    </div>
  );
}

function StatCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string | number;
  accentClass: string;
}) {
  return (
    <div className="bg-bg-surface border-bg-elevated rounded-xl border px-4 py-3">
      <p className="text-text-secondary text-xs tracking-wide uppercase">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
