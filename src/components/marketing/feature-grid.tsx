import { FEATURE_GRID_ITEMS, type FeatureGridItem } from "@/lib/marketing-content";

const ICONS: Record<string, React.ReactNode> = {
  "Curated playlists": (
    <path
      d="M4 5h12M4 10h12M4 15h7M15 13l4 2.5-4 2.5v-5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "Tagged special videos": (
    <path
      d="M3 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm10 3 4-2.5v7L13 11Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "Student notes": (
    <path
      d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v4h4M7 10h6M7 13h6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "Personalized Pro notes": (
    <path
      d="M10 2 12.2 7.4 18 8l-4.4 3.8L14.8 18 10 14.8 5.2 18l1.2-6.2L2 8l5.8-.6L10 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function FeatureGrid() {
  return (
    <section id="features" className="bg-background scroll-mt-20 px-6 py-20 md:px-16">
      {" "}
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-foreground text-3xl md:text-4xl">
          Everything a chapter needs, in one place
        </h2>
        <p className="text-text-secondary mt-2 max-w-xl text-sm md:text-base">
          Four content types per chapter — no more switching between notebooks, YouTube, and group
          chats.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURE_GRID_ITEMS.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ item }: { item: FeatureGridItem }) {
  const isPro = item.tag === "Pro";

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-accent-primary/10 text-accent-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            {ICONS[item.title]}
          </svg>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
            isPro
              ? "bg-state-premium/10 text-state-premium"
              : "bg-state-success/10 text-state-success"
          }`}
        >
          {item.tag}
        </span>
      </div>
      <h3 className="font-display text-foreground mt-4 text-lg">{item.title}</h3>
      <p className="text-text-secondary mt-1.5 text-sm">{item.description}</p>
    </div>
  );
}
