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

export function ChapterSectionCards({ cards }: { cards: ChapterSectionCard[] }) {
  return (
    <div className="grid max-w-5xl grid-cols-2 gap-x-3 gap-y-6 pt-1 pb-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8">
      {cards.map((card, index) => (
        <SectionCard key={card.key} card={card} index={index} />
      ))}
    </div>
  );
}

function SectionCard({ card, index }: { card: ChapterSectionCard; index: number }) {
  const toast = useToast();
  const meta = CHAPTER_SECTIONS[card.key];
  const faceClass = "subject-card-face";
  const content = <CardContent card={card} />;

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
    face = (
      <div className={faceClass}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`subject-card ${card.state === "soon" ? "subject-card--soon" : ""}`}
      style={
        {
          "--card-accent": meta.accent,
          "--float-delay": `${-(index % 6) * 0.9}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="relative aspect-4/3 sm:aspect-5/4">{face}</div>
      </div>
    </div>
  );
}

function CardContent({ card }: { card: ChapterSectionCard }) {
  const meta = CHAPTER_SECTIONS[card.key];
  const soon = card.state === "soon";

  return (
    <span className="subject-card-inner @container flex flex-col items-center justify-center p-3 text-center">
      {card.state === "locked" && (
        <span className="border-gold/40 text-gold-soft absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full border bg-black/50 px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
          <Lock className="h-2.5 w-2.5" />
          Pro
        </span>
      )}
      {soon && (
        <span className="text-gold-soft/80 absolute top-2.5 right-2.5 z-10 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
          Soon
        </span>
      )}

      <span
        className={`relative z-10 flex items-center justify-center ${soon ? "opacity-60 grayscale-[0.6]" : ""}`}
      >
        <span className="absolute h-16 w-16 rounded-full bg-(--card-accent) opacity-25 blur-xl" />
        <span
          aria-hidden="true"
          className="relative text-4xl leading-none @min-[200px]:text-5xl @min-[260px]:text-6xl"
        >
          {meta.emoji}
        </span>
      </span>

      <span
        className={`gold-text font-display relative z-10 mt-2.5 text-sm leading-tight font-semibold tracking-wide uppercase @min-[200px]:mt-3 @min-[200px]:text-lg ${soon ? "opacity-70" : ""}`}
      >
        {meta.title}
      </span>
      {soon && card.featureKey ? (
        <span className="relative z-10 mt-1.5">
          <NotifyMeButton
            featureKey={card.featureKey}
            initialSubscribed={card.subscribed ?? false}
            variant="card"
          />
        </span>
      ) : (
        <span className="text-gold-soft/60 relative z-10 mt-1 text-[9px] font-medium tracking-[0.18em] uppercase @min-[200px]:text-[10px]">
          {soon ? "Coming soon" : card.subtitle}
        </span>
      )}

      <span className="subject-card-sheen" />
    </span>
  );
}
