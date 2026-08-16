"use client";

import { useState, useTransition } from "react";
import {
  commentOnStudentNote,
  updateStudentNoteComment,
  deleteStudentNoteComment,
} from "@/actions/student-notes";

type Comment = {
  id: string;
  body: string;
  studentName: string;
  isOwn: boolean;
};

export function NoteComments({ noteId, comments }: { noteId: string; comments: Comment[] }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const visible = expanded ? comments : comments.slice(0, 3);
  const hiddenCount = comments.length - visible.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const formData = new FormData();
    formData.set("noteId", noteId);
    formData.set("body", draft.trim());
    startTransition(() => {
      commentOnStudentNote({ success: false }, formData);
    });
    setDraft("");
  }

  return (
    <div className="border-bg-elevated border-t px-4 py-3">
      {comments.length > 0 && (
        <div className="space-y-2.5">
          {visible.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-text-secondary hover:text-foreground text-xs font-medium"
            >
              View {hiddenCount} more comment{hiddenCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment..."
          maxLength={500}
          className="bg-bg-elevated text-foreground placeholder:text-text-secondary focus:ring-accent-primary flex-1 rounded-full px-3.5 py-2 text-sm focus:ring-1 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !draft.trim()}
          className="text-accent-primary text-sm font-medium disabled:opacity-40"
        >
          Post
        </button>
      </form>
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!draft.trim()) return;
    const formData = new FormData();
    formData.set("id", comment.id);
    formData.set("body", draft.trim());
    startTransition(() => {
      updateStudentNoteComment({ success: false }, formData);
    });
    setEditing(false);
  }

  function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    const formData = new FormData();
    formData.set("id", comment.id);
    startTransition(() => {
      deleteStudentNoteComment({ success: false }, formData);
    });
  }

  return (
    <div className="flex items-start gap-2">
      <div className="bg-bg-elevated text-text-secondary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
        {comment.studentName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              className="bg-bg-elevated text-foreground flex-1 rounded-full px-3 py-1.5 text-xs focus:outline-none"
            />
            <button onClick={handleSave} className="text-accent-primary text-xs font-medium">
              Save
            </button>
          </div>
        ) : (
          <div className="bg-bg-elevated inline-block rounded-2xl px-3 py-1.5">
            <p className="text-foreground text-xs font-semibold">{comment.studentName}</p>
            <p className="text-foreground text-sm">{comment.body}</p>
          </div>
        )}
        {comment.isOwn && !editing && (
          <div className="mt-0.5 flex gap-3 pl-3">
            <button
              onClick={() => setEditing(true)}
              className="text-text-secondary hover:text-foreground text-[11px] font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-text-secondary hover:text-state-warning text-[11px] font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
