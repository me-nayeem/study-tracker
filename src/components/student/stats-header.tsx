import { Flame, Gem, Shield, type LucideIcon } from "lucide-react";
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
    <div className="mt-4 grid max-w-3xl grid-cols-3 gap-2.5 sm:gap-3">
      <StatTile
        icon={Shield}
        iconClass={`${tier.bgClass} ${tier.textClass}`}
        label="Level"
        value={tier.tierName}
        valueClass={`font-display ${tier.textClass}`}
        caption={`Tier ${tier.tierNumber}`}
      />
      <StatTile
        icon={Gem}
        iconClass="bg-accent-gamify/10 text-accent-gamify"
        label="Points"
        value={totalPoints.toLocaleString()}
        valueClass="gold-text font-mono tabular-nums"
        caption="Total earned"
      />
      <StatTile
        icon={Flame}
        iconClass="bg-accent-primary/10 text-accent-primary"
        label="Streak"
        value={String(streakCount)}
        valueClass="text-state-success font-mono tabular-nums"
        caption={streakCount === 1 ? "Day" : "Days"}
      />
    </div>
  );
}

function StatTile({
  icon: Icon,
  iconClass,
  label,
  value,
  valueClass,
  caption,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  valueClass: string;
  caption: string;
}) {
  return (
    <div className="border-gold/20 from-bg-surface to-ink relative min-w-0 overflow-hidden rounded-2xl border bg-linear-to-b p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-secondary truncate text-[10px] font-medium tracking-[0.18em] uppercase sm:text-xs">
          {label}
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7 ${iconClass}`}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
      </div>
      <p
        className={`mt-2 truncate text-lg leading-tight font-semibold sm:text-2xl ${valueClass}`}
        title={value}
      >
        {value}
      </p>
      <p className="text-text-secondary mt-0.5 truncate text-[10px] sm:text-xs">{caption}</p>
    </div>
  );
}
