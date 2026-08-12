import Link from "next/link";
import type { ChapterPickerResult } from "@/lib/curriculum-data";

export function ChapterPickerList({
  chapters,
  basePath,
  query,
}: {
  chapters: ChapterPickerResult[];
  basePath: string;
  query: string;
}) {
  if (chapters.length === 0) {
    return (
      <p className="text-text-secondary text-sm">
        {query ? "No chapters match that search." : "Start typing to find a chapter to manage."}
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {chapters.map((chapter) => (
        <li key={chapter.id}>
          <Link
            href={`${basePath}/${chapter.id}`}
            className="bg-bg-surface border-bg-elevated hover:bg-bg-elevated/50 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors"
          >
            <span className="min-w-0">
              <span className="text-foreground block truncate text-sm font-medium">
                {chapter.name}
              </span>
              <span className="text-text-secondary block truncate text-xs">
                {chapter.paper.subject.track.name} · {chapter.paper.subject.name} ·{" "}
                {chapter.paper.name}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
