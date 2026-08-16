import Link from "next/link";
import type { MasteryStatus } from "@/generated/prisma/enums";
import { MasteryBadge } from "./mastery-badge";

export function ChapterRow({
  chapter,
  percent,
  status,
}: {
  chapter: { id: string; name: string };
  percent: number;
  status: MasteryStatus;
}) {
  return (
    <li>
      <Link
        href={`/chapter/${chapter.id}`}
        className="bg-bg-elevated hover:bg-bg-elevated/70 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
      >
        <span className="text-foreground min-w-0 truncate">{chapter.name}</span>
        <span className="flex shrink-0 items-center gap-3">
          <MasteryBadge status={status} />
          <span className="text-text-secondary w-10 text-right font-mono text-xs">{percent}%</span>
        </span>
      </Link>
    </li>
  );
}
