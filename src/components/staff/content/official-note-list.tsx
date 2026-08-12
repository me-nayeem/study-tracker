"use client";

import { useState } from "react";
import type { OfficialNote } from "@/generated/prisma/client";
import { setOfficialNoteArchived } from "@/actions/content";
import { ArchiveToggleButton } from "@/components/staff/curriculum/toggle-buttons";
import { buttonGhostClass, buttonSecondaryClass } from "@/components/shared/classes";
import { OfficialNoteForm, ACCESS_LABELS } from "./official-note-forms";

export function OfficialNoteManager({
  chapterId,
  notes,
}: {
  chapterId: string;
  notes: OfficialNote[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
        {adding ? (
          <OfficialNoteForm
            chapterId={chapterId}
            onSuccess={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={buttonSecondaryClass}>
            + Add note
          </button>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="text-text-secondary text-sm">No official notes added yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteRow key={note.id} chapterId={chapterId} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteRow({ chapterId, note }: { chapterId: string; note: OfficialNote }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="bg-state-premium/10 text-state-premium rounded-full px-2 py-0.5 text-[10px] font-medium">
            {ACCESS_LABELS[note.accessType]}
          </span>
          <p className="text-foreground mt-1 truncate font-medium">
            {note.title}
            {note.isArchived && <ArchivedBadge />}
          </p>
          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary block truncate text-xs underline-offset-4 hover:underline"
          >
            {note.fileUrl}
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={note.id}
            isArchived={note.isArchived}
            action={setOfficialNoteArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated mt-4 border-t pt-4">
          <OfficialNoteForm
            chapterId={chapterId}
            note={note}
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
