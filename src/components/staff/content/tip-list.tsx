"use client";

import { useState } from "react";
import type { ChapterTip } from "@/generated/prisma/client";
import { setChapterTipArchived } from "@/actions/content";
import { ArchiveToggleButton } from "@/components/staff/curriculum/toggle-buttons";
import { buttonGhostClass, buttonSecondaryClass } from "@/components/shared/classes";
import { TipForm } from "./tip-forms";

const CATEGORY_LABELS: Record<string, string> = {
  LAW: "Law",
  SHORTCUT: "Shortcut",
  CALCULATOR_HACK: "Calculator Hack",
};

export function TipManager({ chapterId, tips }: { chapterId: string; tips: ChapterTip[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
        {adding ? (
          <TipForm
            chapterId={chapterId}
            onSuccess={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={buttonSecondaryClass}>
            + Add tip
          </button>
        )}
      </div>

      {tips.length === 0 ? (
        <p className="text-text-secondary text-sm">No tips added yet.</p>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => (
            <TipRow key={tip.id} chapterId={chapterId} tip={tip} />
          ))}
        </div>
      )}
    </div>
  );
}

function TipRow({ chapterId, tip }: { chapterId: string; tip: ChapterTip }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="bg-accent-gamify/10 text-accent-gamify rounded-full px-2 py-0.5 text-[10px] font-medium">
            {CATEGORY_LABELS[tip.category] ?? tip.category}
          </span>
          <p className="text-foreground mt-1 truncate font-medium">
            {tip.title}
            {tip.isArchived && <ArchivedBadge />}
          </p>
          {tip.youtubeUrl && (
            <a
              href={tip.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary block truncate text-xs underline-offset-4 hover:underline"
            >
              {tip.youtubeUrl}
            </a>
          )}
          {tip.driveLink && (
            <a
              href={tip.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary block truncate text-xs underline-offset-4 hover:underline"
            >
              {tip.driveLink}
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={tip.id}
            isArchived={tip.isArchived}
            action={setChapterTipArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated mt-4 border-t pt-4">
          <TipForm
            chapterId={chapterId}
            tip={tip}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

function ArchivedBadge() {
  return (
    <span className="bg-state-warning/10 text-state-warning ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-medium">
      Archived
    </span>
  );
}
