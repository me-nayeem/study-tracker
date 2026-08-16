import { ExternalLink } from "lucide-react";
import type { ChapterTipRow } from "@/lib/content-data";
import { YoutubeEmbed } from "./youtube-embed";

const CATEGORY_LABEL: Record<string, string> = {
  LAW: "Laws",
  SHORTCUT: "Shortcut Methods",
  CALCULATOR_HACK: "Calculator Hacks",
};

export function TipsSection({ tips }: { tips: ChapterTipRow[] }) {
  if (tips.length === 0) {
    return (
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">No tips added yet for this chapter.</p>
      </div>
    );
  }

  const grouped = tips.reduce<Record<string, ChapterTipRow[]>>((acc, tip) => {
    (acc[tip.category] ??= []).push(tip);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-text-secondary text-xs font-medium tracking-wide uppercase">
            {CATEGORY_LABEL[category] ?? category}
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((tip) => (
              <div key={tip.id} className="bg-bg-surface border-bg-elevated rounded-xl border p-4">
                <p className="text-foreground text-sm font-medium">{tip.title}</p>
                {tip.youtubeUrl && (
                  <div className="mt-3">
                    <YoutubeEmbed url={tip.youtubeUrl} title={tip.title} />
                  </div>
                )}
                {tip.driveLink && (
                  <a
                    href={tip.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent-primary text-background mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
