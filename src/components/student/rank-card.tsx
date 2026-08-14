export function RankCard({ rank, points }: { rank: number | null; points: number }) {
  return (
    <div className="border-bg-elevated bg-bg-surface flex items-center justify-between rounded-xl border p-4">
      <div>
        <p className="text-text-secondary text-xs">Your rank</p>
        <p className="font-display text-foreground text-2xl">
          {rank ? `#${rank}` : "Not ranked yet"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-text-secondary text-xs">Your points</p>
        <p className="text-accent-gamify font-mono text-2xl">{points}</p>
      </div>
    </div>
  );
}
