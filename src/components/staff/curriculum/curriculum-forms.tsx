"use client";

import {
  createTrack,
  updateTrack,
  createSubject,
  updateSubject,
  createPaper,
  updatePaper,
  createChapter,
  updateChapter,
  createTopic,
  updateTopic,
} from "@/actions/curriculum";
import { EducationLevel, GroupType } from "@/generated/prisma/enums";
import { EntityForm } from "./entity-form";
import { inputClass, labelClass, errorTextClass } from "./classes";
import type {
  TrackWithChildren,
  SubjectWithChildren,
  PaperWithChildren,
  ChapterWithChildren,
  TopicNode,
} from "@/lib/curriculum-data";

export function TrackForm({
  track,
  onSuccess,
  onCancel,
}: {
  track?: TrackWithChildren;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={track ? updateTrack : createTrack}
      submitLabel={track ? "Save changes" : "Add track"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={track ? { id: track.id } : undefined}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Name</label>
            <input
              name="name"
              defaultValue={track?.name}
              placeholder="HSC Science 2027"
              className={inputClass}
            />
            {state.fieldErrors?.name && (
              <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Level</label>
              <select
                name="level"
                defaultValue={track?.level ?? EducationLevel.HSC}
                className={inputClass}
              >
                {Object.values(EducationLevel).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Group</label>
              <select
                name="group"
                defaultValue={track?.group ?? GroupType.SCIENCE}
                className={inputClass}
              >
                {Object.values(GroupType).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Batch year</label>
              <input
                name="batchYear"
                type="number"
                defaultValue={track?.batchYear}
                className={inputClass}
              />
              {state.fieldErrors?.batchYear && (
                <p className={errorTextClass}>{state.fieldErrors.batchYear[0]}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Exam date (optional)</label>
              <input
                name="examDate"
                type="date"
                defaultValue={
                  track?.examDate ? track.examDate.toISOString().slice(0, 10) : undefined
                }
                className={inputClass}
              />
            </div>
          </div>
        </>
      )}
    </EntityForm>
  );
}

export function SubjectForm({
  trackId,
  subject,
  onSuccess,
  onCancel,
}: {
  trackId: string;
  subject?: SubjectWithChildren;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={subject ? updateSubject : createSubject}
      submitLabel={subject ? "Save changes" : "Add subject"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={subject ? { id: subject.id, trackId } : { trackId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Name</label>
            <input
              name="name"
              defaultValue={subject?.name}
              placeholder="Chemistry"
              className={inputClass}
            />
            {state.fieldErrors?.name && (
              <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={subject?.order ?? 0}
              className={inputClass}
            />
          </div>
        </>
      )}
    </EntityForm>
  );
}

export function PaperForm({
  subjectId,
  paper,
  onSuccess,
  onCancel,
}: {
  subjectId: string;
  paper?: PaperWithChildren;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={paper ? updatePaper : createPaper}
      submitLabel={paper ? "Save changes" : "Add paper"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={paper ? { id: paper.id, subjectId } : { subjectId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Name</label>
            <input
              name="name"
              defaultValue={paper?.name}
              placeholder="1st Paper"
              className={inputClass}
            />
            {state.fieldErrors?.name && (
              <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={paper?.order ?? 0}
              className={inputClass}
            />
          </div>
        </>
      )}
    </EntityForm>
  );
}

export function ChapterForm({
  paperId,
  chapter,
  onSuccess,
  onCancel,
}: {
  paperId: string;
  chapter?: ChapterWithChildren;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={chapter ? updateChapter : createChapter}
      submitLabel={chapter ? "Save changes" : "Add chapter"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={chapter ? { id: chapter.id, paperId } : { paperId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Name</label>
            <input
              name="name"
              defaultValue={chapter?.name}
              placeholder="Chemical Bonding"
              className={inputClass}
            />
            {state.fieldErrors?.name && (
              <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Order</label>
              <input
                name="order"
                type="number"
                defaultValue={chapter?.order ?? 0}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Exam weight</label>
              <input
                name="examWeight"
                type="number"
                step="0.1"
                defaultValue={chapter?.examWeight ?? 1.0}
                className={inputClass}
              />
              {state.fieldErrors?.examWeight && (
                <p className={errorTextClass}>{state.fieldErrors.examWeight[0]}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Pass %</label>
              <input
                name="masteryPassPercent"
                type="number"
                defaultValue={chapter?.masteryPassPercent ?? 70}
                className={inputClass}
              />
              {state.fieldErrors?.masteryPassPercent && (
                <p className={errorTextClass}>{state.fieldErrors.masteryPassPercent[0]}</p>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="isFreePreview"
              type="checkbox"
              defaultChecked={chapter?.isFreePreview ?? false}
              value="true"
              className="accent-accent-primary h-4 w-4"
            />
            <span className={labelClass}>Free preview (visible without Pro)</span>
          </label>
        </>
      )}
    </EntityForm>
  );
}

export function TopicForm({
  chapterId,
  topic,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  topic?: TopicNode;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={topic ? updateTopic : createTopic}
      submitLabel={topic ? "Save changes" : "Add topic"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={topic ? { id: topic.id, chapterId } : { chapterId }}
    >
      {(state) => (
        <>
          <div>
            <label className={labelClass}>Name</label>
            <input
              name="name"
              defaultValue={topic?.name}
              placeholder="Ionic bonds"
              className={inputClass}
            />
            {state.fieldErrors?.name && (
              <p className={errorTextClass}>{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="order"
              type="number"
              defaultValue={topic?.order ?? 0}
              className={inputClass}
            />
          </div>
                    <div>
           <label className={labelClass}>
              Practice exam file <span className="font-normal">(optional)</span>
            </label>
            <input
              name="examHtmlFileName"
              type="text"
              defaultValue={topic?.examHtmlFileName ?? ""}
              placeholder="matrices-intro-exam.html"
              className={inputClass}
            />
            <p className="text-text-secondary mt-1 text-xs">
              Must exactly match a file placed in public/exams/
            </p>
            {state.fieldErrors?.examHtmlFileName && (
              <p className={errorTextClass}>{state.fieldErrors.examHtmlFileName[0]}</p>
            )}
          </div>
        </>
      )}
    </EntityForm>
  );
}
