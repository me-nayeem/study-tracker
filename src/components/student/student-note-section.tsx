"use client";

import { useState, useTransition } from "react";
import { setStudentNoteVisibility } from "@/actions/student-notes";
import { buttonGhostClass, buttonSecondaryClass } from "@/components/shared/classes";
import { StudentNoteForm } from "./student-note-form";
import type { StudentNoteOwnerRow, PublicStudentNoteRow } from "@/lib/content-data";

export function StudentNoteSection({
  chapterId,
  ownNotes,
  publicNotes,
}: {
  chapterId: string;
  ownNotes: StudentNoteOwnerRow[];
  publicNotes: PublicStudentNoteRow[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-text-secondary mb-2 text-xs font-medium tracking-wide uppercase">
          My notes
        </h3>

        <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
          {adding ? (
            <StudentNoteForm
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

        {ownNotes.length > 0 && (
          <div className="mt-3 space-y-3">
            {ownNotes.map((note) => (
              <OwnNoteRow key={note.id} chapterId={chapterId} note={note} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-text-secondary mb-2 text-xs font-medium tracking-wide uppercase">
          Community notes
        </h3>
        {publicNotes.length === 0 ? (
          <p className="text-text-secondary text-sm">No shared notes for this chapter yet.</p>
        ) : (
          <div className="space-y-2">
            {publicNotes.map((note) => (
              <a
                key={note.id}
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bg-elevated hover:bg-bg-elevated/70 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
              >
                <span className="text-foreground min-w-0 truncate">{note.title}</span>
                <span className="text-text-secondary shrink-0 text-xs">
                  {note.student.user.name ?? "Anonymous"}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OwnNoteRow({ chapterId, note }: { chapterId: string; note: StudentNoteOwnerRow }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleVisibility() {
    const next = !note.isPublic;
    const formData = new FormData();
    formData.set("id", note.id);
    formData.set("isPublic", String(next));
    startTransition(async () => {
      const result = await setStudentNoteVisibility({ success: false }, formData);
      if (!result.success) alert(result.error ?? "Failed to update.");
    });
  }

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{note.title}</p>
          <p
            className={`mt-0.5 text-xs font-medium ${
              note.isPublic ? "text-state-success" : "text-text-secondary"
            }`}
          >
            {note.isPublic ? "Public" : "Private"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={isPending}
            className={buttonGhostClass}
          >
            {isPending ? "…" : note.isPublic ? "Make private" : "Make public"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated mt-4 border-t pt-4">
          <StudentNoteForm
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
