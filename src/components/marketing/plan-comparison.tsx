import { PLAN_COMPARISON_ROWS } from "@/lib/marketing-content";

function StatusIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg viewBox="0 0 16 16" className="text-state-success h-4 w-4" fill="none">
        <path
          d="M3 8.5 6.2 12 13 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="text-text-secondary/50 h-4 w-4" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlanComparison() {
  return (
    <section id="pricing" className="bg-background scroll-mt-20 px-6 py-20 md:px-16">
      {" "}
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-display text-foreground text-3xl md:text-4xl">Free vs Pro</h2>
          <p className="text-text-secondary mt-2 text-sm md:text-base">
            The core loop is free, always. Pro adds depth where it genuinely costs more to build.
          </p>
        </div>

        <div className="border-bg-elevated bg-bg-surface mt-10 overflow-hidden rounded-2xl border">
          <div className="border-bg-elevated grid grid-cols-[1fr_auto_auto] border-b">
            <div />
            <div className="text-text-secondary px-4 py-3 text-center text-xs font-medium tracking-wide uppercase">
              Free
            </div>
            <div className="text-state-premium px-4 py-3 text-center text-xs font-medium tracking-wide uppercase">
              Pro
            </div>
          </div>

          {PLAN_COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_auto_auto] items-center ${
                i !== PLAN_COMPARISON_ROWS.length - 1 ? "border-bg-elevated border-b" : ""
              }`}
            >
              <div className="text-foreground px-4 py-3 text-sm">{row.feature}</div>
              <div className="flex justify-center px-2 py-3 sm:px-4">
                <StatusIcon included={row.free} />
              </div>
              <div className="flex justify-center px-2 py-3 sm:px-4">
                <StatusIcon included={row.pro} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
