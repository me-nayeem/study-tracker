import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CHAPTER_SECTIONS, type ChapterSectionKey } from "@/lib/chapter-sections";

export function ChapterSubpageHeader({
  section,
  chapter,
}: {
  section: ChapterSectionKey;
  chapter: { id: string; name: string; paper: { name: string; subject: { name: string } } };
}) {
  const meta = CHAPTER_SECTIONS[section];

  return (
    <div className="mb-6">
      <Link
        href={`/chapter/${chapter.id}`}
        className="border-gold/30 text-gold-soft/80 hover:border-gold hover:text-gold-soft inline-flex max-w-full items-center gap-1 rounded-full border bg-black/30 py-1 pr-3 pl-2 text-xs transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{chapter.name}</span>
      </Link>

      <div
        className="mt-3 flex items-center gap-3"
        style={{ "--card-accent": meta.accent } as React.CSSProperties}
      >
        <span className="border-gold/30 relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/40">
          <span className="absolute h-8 w-8 rounded-full bg-(--card-accent) opacity-30 blur-md" />
          <span aria-hidden="true" className="relative text-2xl leading-none">
            {meta.emoji}
          </span>
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-foreground text-2xl leading-tight">{meta.title}</h1>
          <p className="text-text-secondary truncate text-xs">
            {chapter.paper.subject.name} · <span className="capitalize">{chapter.paper.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
