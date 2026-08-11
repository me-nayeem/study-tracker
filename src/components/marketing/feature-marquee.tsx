import { FEATURE_TICKER_ITEMS } from "@/lib/marketing-content";

export function FeatureMarquee() {
  return (
    <div className="border-bg-elevated bg-bg-surface overflow-hidden border-y py-4">
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        <TickerItems />
        <TickerItems hidden />
      </div>
    </div>
  );
}

function TickerItems({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={hidden}>
      {FEATURE_TICKER_ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="text-text-secondary font-mono text-xs tracking-wide uppercase md:text-sm">
            {item}
          </span>
          <span className="bg-accent-primary mx-6 h-1 w-1 shrink-0 rounded-full md:mx-8" />
        </span>
      ))}
    </div>
  );
}
