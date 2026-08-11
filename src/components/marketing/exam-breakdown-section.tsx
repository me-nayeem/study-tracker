import { SAMPLE_EXAM_BREAKDOWN } from "@/lib/marketing-content";

function barColor(percent: number): string {
  if (percent >= 70) return "bg-state-success";
  if (percent >= 50) return "bg-accent-gamify";
  return "bg-state-warning";
}

export function ExamBreakdownSection() {
  const { chapterName, overallPercent, topics } = SAMPLE_EXAM_BREAKDOWN;

  return (
    <section className="bg-bg-surface border-bg-elevated border-y px-6 py-20 md:px-16">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="bg-accent-primary/10 text-accent-primary inline-block rounded-full px-3 py-1 text-xs font-medium">
            Free for everyone
          </span>
          <h2 className="font-display text-foreground mt-4 text-3xl md:text-4xl">
            Not just a score.
            <br />A map of what to fix.
          </h2>
          <p className="text-text-secondary mt-4 max-w-md text-sm md:text-base">
            Every chapter-wise exam feeds back a real breakdown — which topic you got right, which
            one you didn&apos;t, so you know exactly what to revisit instead of re-reading the whole
            chapter again.
          </p>
          <ul className="text-text-secondary mt-6 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="bg-accent-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              Chapter-wide breakdown, free on every account
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-accent-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              Topic-level granularity with Pro
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-accent-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              Feeds straight into your to-do list — no manual planning
            </li>
          </ul>
        </div>

        <div className="border-bg-elevated bg-background rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-text-secondary text-xs">Chapter exam result</p>
              <h3 className="font-display text-foreground text-lg">{chapterName}</h3>
            </div>
            <span className="bg-bg-elevated text-text-secondary rounded-full px-2.5 py-1 text-[10px] font-medium">
              Sample
            </span>
          </div>

          <p className="text-accent-primary mt-4 font-mono text-4xl font-medium">
            {overallPercent}%
          </p>

          <div className="mt-6 space-y-4">
            {topics.map((topic) => (
              <div key={topic.name}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground text-sm">{topic.name}</span>
                  <span className="text-text-secondary font-mono text-xs">{topic.percent}%</span>
                </div>
                <div className="bg-bg-elevated mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${barColor(topic.percent)}`}
                    style={{ width: `${topic.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
