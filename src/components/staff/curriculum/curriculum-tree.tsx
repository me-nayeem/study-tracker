"use client";

import { useState } from "react";
import type {
  TrackWithChildren,
  SubjectWithChildren,
  PaperWithChildren,
  ChapterWithChildren,
  TopicNode as TopicRow,
} from "@/lib/curriculum-data";
import {
  setTrackArchived,
  setSubjectArchived,
  setPaperArchived,
  setChapterArchived,
} from "@/actions/curriculum";
import { TrackForm, SubjectForm, PaperForm, ChapterForm, TopicForm } from "./curriculum-forms";
import { ArchiveToggleButton, DeleteTopicButton } from "./toggle-buttons";
import { buttonGhostClass, buttonSecondaryClass } from "./classes";

export function CurriculumTree({ tracks }: { tracks: TrackWithChildren[] }) {
  const [addingTrack, setAddingTrack] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
        {addingTrack ? (
          <TrackForm
            onSuccess={() => setAddingTrack(false)}
            onCancel={() => setAddingTrack(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingTrack(true)}
            className={buttonSecondaryClass}
          >
            + Add track
          </button>
        )}
      </div>

      {tracks.length === 0 ? (
        <p className="text-text-secondary text-sm">No tracks yet. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <TrackNode key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrackNode({ track }: { track: TrackWithChildren }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border">
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Chevron open={expanded} />
          <div className="min-w-0">
            <p className="text-foreground truncate font-medium">
              {track.name}
              {track.isArchived && <ArchivedBadge />}
            </p>
            <p className="text-text-secondary text-xs">
              {track.level} · {track.group} · {track.batchYear}
            </p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={track.id}
            isArchived={track.isArchived}
            action={setTrackArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated border-t p-4">
          <TrackForm
            track={track}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {expanded && (
        <div className="border-bg-elevated space-y-3 border-t p-4 pl-8">
          {addingSubject ? (
            <SubjectForm
              trackId={track.id}
              onSuccess={() => setAddingSubject(false)}
              onCancel={() => setAddingSubject(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingSubject(true)}
              className={buttonSecondaryClass}
            >
              + Add subject
            </button>
          )}
          {track.subjects.map((subject) => (
            <SubjectNode key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectNode({ subject }: { subject: SubjectWithChildren }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingPaper, setAddingPaper] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-elevated/40 rounded-lg border">
      <div className="flex items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Chevron open={expanded} />
          <p className="text-foreground truncate text-sm font-medium">
            {subject.name}
            {subject.isArchived && <ArchivedBadge />}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={subject.id}
            isArchived={subject.isArchived}
            action={setSubjectArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated border-t p-3">
          <SubjectForm
            trackId={subject.trackId}
            subject={subject}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {expanded && (
        <div className="border-bg-elevated space-y-3 border-t p-3 pl-8">
          {addingPaper ? (
            <PaperForm
              subjectId={subject.id}
              onSuccess={() => setAddingPaper(false)}
              onCancel={() => setAddingPaper(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingPaper(true)}
              className={buttonSecondaryClass}
            >
              + Add paper
            </button>
          )}
          {subject.papers.map((paper) => (
            <PaperNode key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}

function PaperNode({ paper }: { paper: PaperWithChildren }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-lg border">
      <div className="flex items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Chevron open={expanded} />
          <p className="text-foreground truncate text-sm font-medium">
            {paper.name}
            {paper.isArchived && <ArchivedBadge />}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={paper.id}
            isArchived={paper.isArchived}
            action={setPaperArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated border-t p-3">
          <PaperForm
            subjectId={paper.subjectId}
            paper={paper}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {expanded && (
        <div className="border-bg-elevated space-y-3 border-t p-3 pl-8">
          {addingChapter ? (
            <ChapterForm
              paperId={paper.id}
              onSuccess={() => setAddingChapter(false)}
              onCancel={() => setAddingChapter(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingChapter(true)}
              className={buttonSecondaryClass}
            >
              + Add chapter
            </button>
          )}
          {paper.chapters.map((chapter) => (
            <ChapterNode key={chapter.id} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterNode({ chapter }: { chapter: ChapterWithChildren }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingTopic, setAddingTopic] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-elevated/40 rounded-lg border">
      <div className="flex items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Chevron open={expanded} />
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
              {chapter.name}
              {chapter.isArchived && <ArchivedBadge />}
              {!chapter.isFreePreview && <ProLockedBadge />}
            </p>
            <p className="text-text-secondary font-mono text-xs">
              weight {chapter.examWeight.toFixed(1)} · pass {chapter.masteryPassPercent}%
            </p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <ArchiveToggleButton
            id={chapter.id}
            isArchived={chapter.isArchived}
            action={setChapterArchived}
          />
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated border-t p-3">
          <ChapterForm
            paperId={chapter.paperId}
            chapter={chapter}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {expanded && (
        <div className="border-bg-elevated space-y-2 border-t p-3 pl-8">
          {addingTopic ? (
            <TopicForm
              chapterId={chapter.id}
              onSuccess={() => setAddingTopic(false)}
              onCancel={() => setAddingTopic(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingTopic(true)}
              className={buttonSecondaryClass}
            >
              + Add topic
            </button>
          )}
          {chapter.topics.map((topic) => (
            <TopicRowItem key={topic.id} topic={topic} chapterId={chapter.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicRowItem({ topic, chapterId }: { topic: TopicRow; chapterId: string }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-md border p-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground truncate text-sm">{topic.name}</p>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <DeleteTopicButton id={topic.id} />
        </div>
      </div>
      {editing && (
        <div className="mt-2">
          <TopicForm
            chapterId={chapterId}
            topic={topic}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}


function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
    >
      <path
        d="M4 2l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProLockedBadge() {
  return (
    <span className="bg-state-premium/10 text-state-premium ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-medium">
      Pro-locked
    </span>
  );
}

function ArchivedBadge() {
  return (
    <span className="bg-state-warning/10 text-state-warning ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-medium">
      Archived
    </span>
  );
}
