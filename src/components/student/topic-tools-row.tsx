import { ClipboardList, PlayCircle, type LucideIcon } from "lucide-react";

/** One topic on the chapter's Topics page, with its (not yet available) exam and video. */
export function TopicToolsRow({ name, index }: { name: string; index: number }) {
  return (
    <div
      className="subject-card subject-card--row"
      style={{ "--float-delay": `${-(index % 5) * 1.1}s` } as React.CSSProperties}
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="bg-bg-elevated text-foreground/80 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-foreground min-w-0 text-sm leading-snug font-medium sm:text-base">
                {name}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2">
              <SoonButton icon={ClipboardList} label="Exam" />
              <SoonButton icon={PlayCircle} label="Video" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SoonButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${label} (coming soon)`}
      className="text-foreground/45 inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm font-medium"
    >
      <Icon className="h-4 w-4" />
      {label}
      <span className="bg-gold/10 text-gold rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
        Soon
      </span>
    </button>
  );
}
