export type LevelTier = {
  tierName: string;
  tierNumber: number; 
  label: string; 
  bgClass: string;
  textClass: string;
};

const TIERS: { name: string; bgClass: string; textClass: string }[] = [
  { name: "Bronze", bgClass: "bg-state-premium/10", textClass: "text-state-premium" },
  { name: "Silver", bgClass: "bg-text-secondary/10", textClass: "text-text-secondary" },
  { name: "Gold", bgClass: "bg-accent-gamify/10", textClass: "text-accent-gamify" },
  { name: "Platinum", bgClass: "bg-accent-teal/10", textClass: "text-accent-teal" },
  { name: "Diamond", bgClass: "bg-accent-blue/10", textClass: "text-accent-blue" },
];

export function getLevelTier(level: number): LevelTier {
  const safeLevel = Math.max(1, level);
  const tierIndex = Math.min(Math.floor((safeLevel - 1) / 10), TIERS.length - 1);
  const tierNumber = safeLevel - tierIndex * 10;
  const tier = TIERS[tierIndex];

  return {
    tierName: tier.name,
    tierNumber,
    label: `${tier.name} ${tierNumber}`,
    bgClass: tier.bgClass,
    textClass: tier.textClass,
  };
}