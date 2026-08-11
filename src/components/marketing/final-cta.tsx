export function FinalCta() {
  return (
    <section className="bg-bg-surface border-bg-elevated border-t px-6 py-20 text-center md:px-16">
      <div className="mx-auto max-w-xl">
        <h2 className="font-display text-foreground text-3xl md:text-4xl">
          Stop guessing what to study next.
        </h2>
        <p className="text-text-secondary mt-3 text-sm md:text-base">
          Free to start, no card required — your track, your chapters, your weak spots, all in one
          place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/login"
            className="bg-accent-primary text-foreground rounded-lg px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98] md:text-base"
          >
            Get started free
          </a>
        </div>
      </div>
    </section>
  );
}
