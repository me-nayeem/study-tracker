"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { getSubjectArt, type SubjectArt } from "@/lib/subject-art";
import type { FeatureKey } from "@/lib/coming-soon";
import { NotifyMeButton } from "@/components/shared/notify-me-button";
import { ProgressBar } from "@/components/shared/progress-bar";

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
        // stagger the idle float so the cards don't bob in unison
        { "--float-delay": `${-(index % 4) * 1.3}s` } as React.CSSProperties
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
            className="deck-face subject-card-face--front @container"
          >
            <CardFront subject={subject} art={art} />
          </button>

          <div
            ref={backRef}
            inert={!flipped}
            className="deck-face subject-card-face--back @container"
          >
            <CardBack subject={subject} onClose={() => flip(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Subject illustration on its inset panel; falls back to the subject icon. */
function ArtPanel({
  art,
  muted = false,
  children,
}: {
  art: SubjectArt;
  muted?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <span className="card-well relative m-1.5 block min-h-0 flex-1 rounded-[0.95rem]">
      <span className={`absolute inset-[12%] ${muted ? "opacity-45 grayscale" : ""}`}>
        {art.image ? (
          <Image
            src={art.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 1024px) 26vw, 40vw"
            className="object-contain"
          />
        ) : (
          <span className="text-foreground/35 flex h-full items-center justify-center">
            <art.icon className="h-1/2 w-1/2" strokeWidth={1.25} />
          </span>
        )}
      </span>
      {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-foreground/80 absolute top-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm @min-[200px]:top-2.5 @min-[200px]:left-2.5 @min-[200px]:text-[11px]">
      {children}
    </span>
  );
}

function CardFront({ subject, art }: { subject: SubjectCardData; art: SubjectArt }) {
  const paperCount = subject.papers.length;

  return (
    <>
      <ArtPanel art={art}>
        <Chip>
          {paperCount} {paperCount === 1 ? "paper" : "papers"}
        </Chip>
      </ArtPanel>

      <span className="block px-3 pt-1.5 pb-3 @min-[200px]:px-4 @min-[200px]:pb-4">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-foreground truncate text-sm font-semibold @min-[200px]:text-base">
            {subject.name}
          </span>
          <span className="text-gold shrink-0 text-xs font-semibold tabular-nums @min-[200px]:text-sm">
            {Math.round(subject.percent)}%
          </span>
        </span>
        <span className="text-text-secondary mt-0.5 mb-2.5 block truncate text-[11px] @min-[200px]:text-xs">
          {subject.masteredCount}/{subject.chapterCount} chapters mastered
        </span>
        <ProgressBar percent={subject.percent} />
      </span>
    </>
  );
}

function CardBack({ subject, onClose }: { subject: SubjectCardData; onClose: () => void }) {
  return (
    <div className="flex h-full flex-col p-3 @min-[200px]:p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold @min-[200px]:text-base">
            {subject.name}
          </p>
          <p className="text-text-secondary text-[11px] @min-[200px]:text-xs">Choose a paper</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-foreground/70 hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/6 transition-colors hover:bg-white/12 @min-[200px]:h-8 @min-[200px]:w-8"
        >
          <X className="h-3.5 w-3.5 @min-[200px]:h-4 @min-[200px]:w-4" />
        </button>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {subject.papers.length === 0 ? (
          <p className="text-text-secondary m-auto text-center text-xs">No papers added yet.</p>
        ) : (
          subject.papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/paper/${paper.id}`}
              className="group bg-bg-elevated/70 hover:bg-bg-elevated block rounded-xl border border-white/5 px-2.5 py-2 transition-colors hover:border-white/10 @min-[200px]:px-3 @min-[200px]:py-2.5"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="text-foreground block truncate text-xs font-semibold capitalize @min-[200px]:text-sm">
                    {paper.name}
                  </span>
                  <span className="text-text-secondary block text-[10px] @min-[200px]:text-xs">
                    {paper.chapterCount} {paper.chapterCount === 1 ? "chapter" : "chapters"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="text-gold text-[11px] font-semibold tabular-nums @min-[200px]:text-xs">
                    {Math.round(paper.percent)}%
                  </span>
                  <ChevronRight className="text-foreground/50 group-hover:text-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
              <span className="mt-2 block">
                <ProgressBar percent={paper.percent} />
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
      style={{ "--float-delay": `${-(index % 4) * 1.3}s` } as React.CSSProperties}
    >
      <div className="subject-card-float">
        <div className="relative aspect-3/4">
          <div className="deck-face @container">
            <ArtPanel art={art} muted>
              <Chip>Coming soon</Chip>
            </ArtPanel>

            <div className="px-3 pt-1.5 pb-3 @min-[200px]:px-4 @min-[200px]:pb-4">
              <p className="text-foreground truncate text-sm font-semibold @min-[200px]:text-base">
                {subject.name}
              </p>
              <p className="text-text-secondary mt-0.5 mb-2 text-[11px] @min-[200px]:text-xs">
                {subject.papers} {subject.papers === 1 ? "paper" : "papers"}
              </p>
              <NotifyMeButton
                featureKey={subject.featureKey}
                initialSubscribed={subject.subscribed}
                variant="card"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
