"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { CHAPTER_SECTIONS, type ChapterSectionKey } from "@/lib/chapter-sections";
import { useToast } from "@/components/shared/dialog-provider";
import { NotifyMeButton } from "@/components/shared/notify-me-button";
import type { FeatureKey } from "@/lib/coming-soon";

export type ChapterSectionCard = {
  key: ChapterSectionKey;
  subtitle: string;
  /** open: navigates to href · locked: Pro-only for this chapter · soon: not built yet */
  state: "open" | "locked" | "soon";
  href?: string;
  /** soon cards: waitlist this card's "Notify me" button joins */
  featureKey?: FeatureKey;
  subscribed?: boolean;
};

/**
 * `guest`: visitor who isn't signed in. Cards still link to their sections (the proxy sends
 * the visitor through login and back), and "Notify me" becomes a sign-in link.
 */
export function ChapterSectionCards({
  cards,
  guest = false,
}: {
  cards: ChapterSectionCard[];
  guest?: boolean;
}) {
  return (
    <div className="grid max-w-5xl grid-cols-2 gap-x-3 gap-y-6 pt-1 pb-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8">
      {cards.map((card, index) => (
        <SectionCard key={card.key} card={card} index={index} guest={guest} />
      ))}
    </div>
  );
}

function SectionCard({
  card,
  index,
  guest,
}: {
  card: ChapterSectionCard;
  index: number;
  guest: boolean;
}) {
  const toast = useToast();
  const meta = CHAPTER_SECTIONS[card.key];
  const faceClass = "subject-card-face";
  const content = <CardContent card={card} guest={guest} />;

  let face: React.ReactNode;
  if (card.state === "open" && card.href) {
    face = (
      <Link href={card.href} className={faceClass}>
        {content}
      </Link>
    );
  } else if (card.state === "locked") {
    face = (
      <button
        type="button"
        onClick={() =>
          toast(
            `${meta.title} for this chapter is Pro content. Ask about Pro access to unlock it.`,
            "info"
          )
        }
        className={`${faceClass} cursor-pointer`}
      >
        {content}
      </button>
    );
  } else {
    face = <div className={faceClass}>{content}</div>;
  }

  return (
    <div
      className={`subject-card ${card.state === "soon" ? "subject-card--soon" : ""}`}
      style={{ "--float-delay": `${-(index % 6) * 0.9}s` } as React.CSSProperties}
    >
      <div className="subject-card-float">
        <div className="relative aspect-4/3 sm:aspect-5/4">{face}</div>
      </div>
    </div>
  );
}

function CardContent({ card, guest }: { card: ChapterSectionCard; guest: boolean }) {
  const meta = CHAPTER_SECTIONS[card.key];
  const soon = card.state === "soon";

  return (
    <span className="subject-card-inner @container flex flex-col p-1.5">
      <span className="card-well relative flex min-h-0 flex-1 items-center justify-center rounded-[0.95rem]">
        <span
          aria-hidden="true"
          className={`text-3xl leading-none @min-[200px]:text-4xl @min-[260px]:text-5xl ${soon ? "opacity-50 grayscale" : ""}`}
        >
          {meta.emoji}
        </span>
        {card.state === "locked" && (
          <span className="text-gold absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
            <Lock className="h-2.5 w-2.5" />
            Pro
          </span>
        )}
        {soon && (
          <span className="text-foreground/80 absolute top-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
            Soon
          </span>
        )}
      </span>

      <span className="block px-1.5 pt-2 pb-1 @min-[200px]:px-2.5 @min-[200px]:pb-2">
        <span className="text-foreground block truncate text-sm font-semibold @min-[200px]:text-base">
          {meta.title}
        </span>
        {soon && card.featureKey ? (
          <span className="mt-1 block">
            <NotifyMeButton
              featureKey={card.featureKey}
              initialSubscribed={card.subscribed ?? false}
              variant="card"
              guest={guest}
            />
          </span>
        ) : (
          <span className="text-text-secondary block truncate text-[11px] @min-[200px]:text-xs">
            {soon ? "Coming soon" : card.subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
