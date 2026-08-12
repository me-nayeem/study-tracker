import type { OfficialNote } from "@/generated/prisma/client";

export function OfficialNoteSection({
  notes,
  isProUnlocked,
}: {
  notes: OfficialNote[];
  isProUnlocked: boolean;
}) {
  if (notes.length === 0) {
    return <p className="text-text-secondary text-sm">No official notes for this chapter yet.</p>;
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => {
        const unlocked = note.accessType === "FREE" || isProUnlocked;

        return unlocked ? (
          <a
            key={note.id}
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-bg-elevated hover:bg-bg-elevated/70 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
          >
            <span className="text-foreground min-w-0 truncate">{note.title}</span>
            {note.accessType !== "FREE" && (
              <span className="bg-state-premium/10 text-state-premium shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">
                Pro
              </span>
            )}
          </a>
        ) : (
          <div
            key={note.id}
            className="bg-bg-elevated/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm opacity-70"
          >
            <span className="text-text-secondary min-w-0 truncate">{note.title}</span>
            <span className="bg-state-premium/10 text-state-premium shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">
              🔒 Pro
            </span>
          </div>
        );
      })}
    </div>
  );
}
