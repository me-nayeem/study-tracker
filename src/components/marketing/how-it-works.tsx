import { HOW_IT_WORKS_STEPS } from "@/lib/marketing-content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background scroll-mt-20 px-6 py-20 md:px-16">
      {" "}
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-foreground text-3xl md:text-4xl">How it works</h2>
        <p className="text-text-secondary mt-2 max-w-xl text-sm md:text-base">
          Four steps from &quot;where do I even start&quot; to knowing exactly what to fix.
        </p>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <li key={step.title} className="border-bg-elevated bg-bg-surface rounded-xl border p-5">
              <span className="bg-accent-primary/10 text-accent-primary flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-medium">
                {i + 1}
              </span>
              <h3 className="font-display text-foreground mt-4 text-lg">{step.title}</h3>
              <p className="text-text-secondary mt-1.5 text-sm">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
