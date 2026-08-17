import { getLevelTier } from "@/lib/level-tier";

export function StatsHeader({
  totalPoints,
  level,
  streakCount,
}: {
  totalPoints: number;
  level: number;
  streakCount: number;
}) {
  const tier = getLevelTier(level);

  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-4 py-3">
        <p className="text-text-secondary text-xs tracking-wide uppercase">Level</p>
        <p className={`mt-1 font-mono text-lg font-semibold whitespace-nowrap ${tier.textClass}`}>
          {tier.label}
        </p>
      </div>

      <StatCard label="Points" value={totalPoints} accentClass="text-accent-gamify" />
      <StatCard label="Streak" value={`${streakCount}d`} accentClass="text-state-success" />
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