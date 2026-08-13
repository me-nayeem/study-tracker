"use client";

import { useState, useTransition } from "react";
import { createQuiz, updateQuiz, setQuizActive, deleteQuiz, deleteQuizQuestion } from "@/actions/quiz";
import { EntityForm } from "@/components/staff/curriculum/entity-form";
import {
  buttonGhostClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
  errorTextClass,
} from "@/components/shared/classes";
import { QuizQuestionForm } from "./quiz-question-form";
import type { StaffQuizRow, StaffQuizQuestionRow } from "@/lib/quiz-data";

export function QuizManager({
  chapterId,
  quizzes,
  topics,
}: {
  chapterId: string;
  quizzes: StaffQuizRow[];
  topics: { id: string; name: string }[];
}) {
  const [addingQuiz, setAddingQuiz] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
        {addingQuiz ? (
          <QuizForm
            chapterId={chapterId}
            onSuccess={() => setAddingQuiz(false)}
            onCancel={() => setAddingQuiz(false)}
          />
        ) : (
          <button type="button" onClick={() => setAddingQuiz(true)} className={buttonSecondaryClass}>
            + Add quiz
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <p className="text-text-secondary text-sm">No quizzes for this chapter yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} chapterId={chapterId} quiz={quiz} topics={topics} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizForm({
  chapterId,
  quiz,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  quiz?: StaffQuizRow;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  return (
    <EntityForm
      action={quiz ? updateQuiz : createQuiz}
      submitLabel={quiz ? "Save changes" : "Add quiz"}
      onSuccess={onSuccess}
      onCancel={onCancel}
      hidden={quiz ? { id: quiz.id, chapterId } : { chapterId }}
    >
      {(state) => (
        <div>
          <label className={labelClass}>Title</label>
          <input name="title" defaultValue={quiz?.title ?? "Validation quiz"} className={inputClass} />
          {state.fieldErrors?.title && <p className={errorTextClass}>{state.fieldErrors.title[0]}</p>}
        </div>
      )}
    </EntityForm>
  );
}

function QuizCard({
  chapterId,
  quiz,
  topics,
}: {
  chapterId: string;
  quiz: StaffQuizRow;
  topics: { id: string; name: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSetActive() {
    const formData = new FormData();
    formData.set("id", quiz.id);
    formData.set("chapterId", chapterId);
    startTransition(async () => {
      const result = await setQuizActive({ success: false }, formData);
      if (!result.success) alert(result.error ?? "Failed to activate quiz.");
    });
  }

  function handleDelete() {
    if (!confirm("Delete this quiz? This can't be undone.")) return;
    const formData = new FormData();
    formData.set("id", quiz.id);
    formData.set("chapterId", chapterId);
    startTransition(async () => {
      const result = await deleteQuiz({ success: false }, formData);
      if (!result.success) alert(result.error ?? "Failed to delete quiz.");
    });
  }

  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border">
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="min-w-0">
            <p className="text-foreground truncate font-medium">
              {quiz.title}
              {quiz.isActive && <ActiveBadge />}
            </p>
            <p className="text-text-secondary font-mono text-xs">
              {quiz.questions.length} question(s) · {quiz._count.attempts} attempt(s)
            </p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          {!quiz.isActive && (
            <button type="button" onClick={handleSetActive} disabled={isPending} className={buttonGhostClass}>
              {isPending ? "…" : "Set active"}
            </button>
          )}
          <button type="button" onClick={handleDelete} disabled={isPending} className={buttonGhostClass}>
            {isPending ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-bg-elevated border-t p-4">
          <QuizForm
            chapterId={chapterId}
            quiz={quiz}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {expanded && (
        <div className="border-bg-elevated space-y-3 border-t p-4">
          {addingQuestion ? (
            <QuizQuestionForm
              chapterId={chapterId}
              quizId={quiz.id}
              topics={topics}
              onSuccess={() => setAddingQuestion(false)}
              onCancel={() => setAddingQuestion(false)}
            />
          ) : (
            <button type="button" onClick={() => setAddingQuestion(true)} className={buttonSecondaryClass}>
              + Add question
            </button>
          )}

          {quiz.questions.length === 0 ? (
            <p className="text-text-secondary text-sm">No questions yet.</p>
          ) : (
            <div className="space-y-2">
              {quiz.questions.map((q) => (
                <QuestionRow key={q.id} chapterId={chapterId} question={q} topics={topics} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionRow({
  chapterId,
  question,
  topics,
}: {
  chapterId: string;
  question: StaffQuizQuestionRow;
  topics: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this question?")) return;
    const formData = new FormData();
    formData.set("id", question.id);
    formData.set("chapterId", chapterId);
    startTransition(async () => {
      const result = await deleteQuizQuestion({ success: false }, formData);
      if (!result.success) alert(result.error ?? "Failed to delete question.");
    });
  }

  const options = question.options as string[];

  return (
    <div className="border-bg-elevated bg-bg-elevated/40 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-medium">{question.questionText}</p>
          <p className="text-text-secondary mt-1 text-xs">Correct: {options[question.correctIndex]}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing((v) => !v)} className={buttonGhostClass}>
            Edit
          </button>
          <button type="button" onClick={handleDelete} disabled={isPending} className={buttonGhostClass}>
            {isPending ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-3">
          <QuizQuestionForm
            chapterId={chapterId}
            quizId={question.quizId}
            topics={topics}
            question={question}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

function ActiveBadge() {
  return (
    <span className="bg-state-success/10 text-state-success ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-medium">
      Active
    </span>
  );
}