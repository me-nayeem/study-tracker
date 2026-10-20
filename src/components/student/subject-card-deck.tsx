"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { getSubjectArt, type SubjectArt } from "@/lib/subject-art";
import type { FeatureKey } from "@/lib/coming-soon";
import { NotifyMeButton } from "@/components/shared/notify-me-button";

export type SubjectCardPaper = {
  id: string;
  name: string;
  percent: number;
  chapterCount: number;
};

export type SubjectCardData = {
  id: string;
  name: string;
  percent: number;
  chapterCount: number;
  masteredCount: number;
  papers: SubjectCardPaper[];
};

export type UpcomingSubjectCardData = {
  featureKey: FeatureKey;
  name: string;
  papers: number;
  subscribed: boolean;
};

export function SubjectCardDeck({
  subjects,
  upcoming = [],
}: {
  subjects: SubjectCardData[];
  upcoming?: UpcomingSubjectCardData[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Escape or a tap outside the open card flips it back.
  useEffect(() => {
    if (!openId) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    function onPointerDown(e: PointerEvent) {
      const card = (e.target as HTMLElement).closest("[data-subject-card]");
      if (card?.getAttribute("data-subject-card") !== openId) setOpenId(null);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openId]);

  return (
    <div className="grid max-w-6xl grid-cols-2 gap-x-3 gap-y-7 pt-2 pb-4 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
      {subjects.map((subject, index) => (
        <SubjectCard
          key={subject.id}
          index={index}
          subject={subject}
          flipped={openId === subject.id}
          onFlip={(next) => setOpenId(next ? subject.id : null)}
        />
      ))}
      {upcoming.map((subject, index) => (
        <UpcomingSubjectCard
          key={subject.featureKey}
          subject={subject}
          index={subjects.length + index}
        />
      ))}
    </div>
  );
}

function SubjectCard({
  index,
  subject,
  flipped,
  onFlip,
}: {
  index: number;
  subject: SubjectCardData;
  flipped: boolean;
  onFlip: (next: boolean) => void;
}) {
  const art = getSubjectArt(subject.name);
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  // Only move focus when this card was flipped by the user, not when another card closes it.
  const focusOnChange = useRef(false);

  useEffect(() => {
    if (!focusOnChange.current) return;
    focusOnChange.current = false;
    if (flipped) {
      const target =
        backRef.current?.querySelector<HTMLElement>("a") ??
        backRef.current?.querySelector<HTMLElement>("button");
      target?.focus({ preventScroll: true });
    } else {
      frontRef.current?.focus({ preventScroll: true });
    }
  }, [flipped]);

  function flip(next: boolean) {
    focusOnChange.current = true;
    onFlip(next);
  }

  return (
    <div
      data-subject-card={subject.id}
      data-flipped={flipped}
      className="subject-card"
      style={
        {
          "--card-accent": art.accent,
          // stagger the idle float so the cards don't bob in unison
          "--float-delay": `${-(index % 4) * 1.3}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="subject-card-body">
          <button
            ref={frontRef}
            type="button"
            onClick={() => flip(true)}
            inert={flipped}
            aria-expanded={flipped}
            aria-label={`${subject.name}, ${Math.round(subject.percent)}% complete. Show papers`}
            className="subject-card-face subject-card-face--front"
          >
            <CardFront subject={subject} art={art} />
          </button>

          <div ref={backRef} inert={!flipped} className="subject-card-face subject-card-face--back">
            <CardBack subject={subject} art={art} onClose={() => flip(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Emblem({ art, size = "md" }: { art: SubjectArt; size?: "sm" | "md" }) {
  const Icon = art.icon;
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8 @min-[220px]:h-10 @min-[220px]:w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4 @min-[220px]:h-5 @min-[220px]:w-5";

  return (
    <span
      className={`from-gold-soft via-gold to-gold-deep flex shrink-0 items-center justify-center rounded-full bg-linear-to-br p-[1.5px] shadow-md ${box}`}
    >
      <span className="bg-ink flex h-full w-full items-center justify-center rounded-full text-(--card-accent)">
        <Icon className={icon} />
      </span>
    </span>
  );
}

function CardFront({ subject, art }: { subject: SubjectCardData; art: SubjectArt }) {
  const paperCount = subject.papers.length;

  return (
    <span className="subject-card-inner @container flex flex-col">
      {/* header: emblem + progress "rating" */}
      <span className="relative z-10 flex items-start justify-between p-3 @min-[220px]:p-4">
        <Emblem art={art} />
        <span className="flex flex-col items-end leading-none">
          <span className="gold-text font-display text-2xl font-semibold @min-[220px]:text-3xl">
            {Math.round(subject.percent)}
            <span className="text-sm @min-[220px]:text-base">%</span>
          </span>
          <span className="text-gold-soft/60 mt-1 text-[8px] font-medium tracking-[0.2em] uppercase @min-[220px]:text-[9px]">
            Done
          </span>
        </span>
      </span>

      {/* artwork */}
      <span className="absolute inset-x-[10%] top-[24%] bottom-[37%] @min-[220px]:inset-x-[12%] @min-[220px]:top-[19%] @min-[220px]:bottom-[35%]">
        {art.image ? (
          <Image
            src={art.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 1024px) 26vw, 40vw"
            className="object-contain"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-(--card-accent) opacity-80">
            <art.icon className="h-1/2 w-1/2" strokeWidth={1.25} />
          </span>
        )}
      </span>

      {/* name plate */}
      <span className="via-ink/85 to-ink relative z-10 mt-auto flex flex-col items-center bg-linear-to-b from-transparent px-3 pt-6 pb-3.5 text-center @min-[220px]:pb-5">
        <span className="gold-text font-display line-clamp-2 text-[15px] leading-tight font-semibold tracking-wide uppercase @min-[200px]:text-lg @min-[260px]:text-2xl">
          {subject.name}
        </span>
        <span className="text-gold-soft/65 mt-1 text-[8px] font-medium tracking-[0.28em] uppercase @min-[200px]:text-[10px]">
          {paperCount} {paperCount === 1 ? "Paper" : "Papers"}
        </span>
        <span className="border-gold/45 text-foreground/90 mt-2 rounded-full border bg-black/40 px-2.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase @min-[200px]:text-[10px]">
          {subject.masteredCount}/{subject.chapterCount} mastered
        </span>
      </span>

      <span className="subject-card-sheen" />
    </span>
  );
}

function CardBack({
  subject,
  art,
  onClose,
}: {
  subject: SubjectCardData;
  art: SubjectArt;
  onClose: () => void;
}) {
  return (
    <div className="subject-card-inner @container flex flex-col p-3 @min-[220px]:p-4">
      {/* watermark art */}
      {art.image && (
        <span className="pointer-events-none absolute inset-[18%] opacity-[0.08]">
          <Image src={art.image} alt="" fill sizes="200px" className="object-contain" />
        </span>
      )}

      <div className="relative z-10 flex items-center gap-2">
        <Emblem art={art} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="gold-text font-display truncate text-xs leading-tight font-semibold uppercase @min-[220px]:text-base">
            {subject.name}
          </p>
          <p className="text-gold-soft/60 text-[8px] tracking-[0.2em] uppercase @min-[220px]:text-[9px]">
            Choose a paper
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="border-gold/45 text-gold-soft hover:border-gold hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-black/50 transition-colors @min-[220px]:h-8 @min-[220px]:w-8"
        >
          <X className="h-3.5 w-3.5 @min-[220px]:h-4 @min-[220px]:w-4" />
        </button>
      </div>

      <div className="relative z-10 mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {subject.papers.length === 0 ? (
          <p className="text-text-secondary m-auto text-center text-xs">No papers added yet.</p>
        ) : (
          subject.papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/paper/${paper.id}`}
              className="group border-gold/35 hover:border-gold relative overflow-hidden rounded-xl border bg-black/45 px-2.5 py-2 transition-colors hover:bg-black/60 @min-[220px]:px-3 @min-[220px]:py-2.5"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="text-foreground block truncate text-xs font-semibold capitalize @min-[220px]:text-sm">
                    {paper.name}
                  </span>
                  <span className="text-text-secondary block text-[10px] @min-[220px]:text-xs">
                    {paper.chapterCount} {paper.chapterCount === 1 ? "chapter" : "chapters"} ·{" "}
                    {Math.round(paper.percent)}%
                  </span>
                </span>
                <ChevronRight className="text-gold h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
                <span
                  className="from-gold-deep to-gold-soft block h-full bg-linear-to-r"
                  style={{ width: `${Math.min(100, Math.max(0, paper.percent))}%` }}
                />
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/** Subject that isn't on the platform yet: same card, no flip, with a "Notify me" button. */
function UpcomingSubjectCard({
  subject,
  index,
}: {
  subject: UpcomingSubjectCardData;
  index: number;
}) {
  const art = getSubjectArt(subject.name);

  return (
    <div
      className="subject-card subject-card--soon"
      style={
        {
          "--card-accent": art.accent,
          "--float-delay": `${-(index % 4) * 1.3}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="relative aspect-3/4">
          <div className="subject-card-face">
            <div className="subject-card-inner @container flex flex-col">
              <div className="relative z-10 flex items-start justify-between p-3 @min-[220px]:p-4">
                <Emblem art={art} />
                <span className="text-gold-soft/90 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase @min-[220px]:text-[10px]">
                  Soon
                </span>
              </div>

              <span className="absolute inset-x-[10%] top-[24%] bottom-[40%] opacity-60 grayscale-[0.5] @min-[220px]:inset-x-[12%] @min-[220px]:top-[19%] @min-[220px]:bottom-[38%]">
                {art.image ? (
                  <Image
                    src={art.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 220px, (min-width: 1024px) 26vw, 40vw"
                    className="object-contain"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-(--card-accent)">
                    <art.icon className="h-1/2 w-1/2" strokeWidth={1.25} />
                  </span>
                )}
              </span>

              <div className="via-ink/85 to-ink relative z-10 mt-auto flex flex-col items-center bg-linear-to-b from-transparent px-3 pt-6 pb-3.5 text-center @min-[220px]:pb-5">
                <span className="gold-text font-display line-clamp-2 text-[15px] leading-tight font-semibold tracking-wide uppercase @min-[200px]:text-lg @min-[260px]:text-2xl">
                  {subject.name}
                </span>
                <span className="text-gold-soft/65 mt-1 text-[8px] font-medium tracking-[0.28em] uppercase @min-[200px]:text-[10px]">
                  Coming soon
                </span>
                <span className="mt-2">
                  <NotifyMeButton
                    featureKey={subject.featureKey}
                    initialSubscribed={subject.subscribed}
                    variant="card"
                  />
                </span>
              </div>

              <span className="subject-card-sheen" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
