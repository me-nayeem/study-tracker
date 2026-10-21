import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CHAPTER_SECTIONS, type ChapterSectionKey } from "@/lib/chapter-sections";
import { backPillClass, headerTileClass } from "@/components/shared/classes";

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
      <Link href={`/chapter/${chapter.id}`} className={backPillClass}>
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{chapter.name}</span>
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span aria-hidden="true" className={headerTileClass}>
          {meta.emoji}
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
