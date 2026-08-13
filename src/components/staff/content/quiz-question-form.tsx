"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createQuizQuestion, updateQuizQuestion } from "@/actions/quiz";
import type { ActionState } from "@/lib/prisma-errors";
import {
  inputClass,
  labelClass,
  errorTextClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  buttonGhostClass,
} from "@/components/shared/classes";
import type { StaffQuizQuestionRow } from "@/lib/quiz-data";

const initialState: ActionState = { success: false };
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export function QuizQuestionForm({
  chapterId,
  quizId,
  topics,
  question,
  onSuccess,
  onCancel,
}: {
  chapterId: string;
  quizId: string;
  topics: { id: string; name: string }[];
  question?: StaffQuizQuestionRow;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const action = question ? updateQuizQuestion : createQuizQuestion;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const initialOptions = (question?.options as string[] | undefined) ?? ["", ""];
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [correctIndex, setCorrectIndex] = useState<number>(question?.correctIndex ?? 0);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(i: number) {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    setCorrectIndex((prev) => (prev === i ? 0 : prev > i ? prev - 1 : prev));
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="chapterId" value={chapterId} />
      {question && <input type="hidden" name="id" value={question.id} />}

      <div>
        <label className={labelClass}>Question</label>
        <textarea
          name="questionText"
          defaultValue={question?.questionText}
          rows={2}
          className={inputClass}
        />
        {state.fieldErrors?.questionText && (
          <p className={errorTextClass}>{state.fieldErrors.questionText[0]}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Options (select the correct one)</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndexPicker"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="accent-accent-primary h-4 w-4 shrink-0"
              />
              <input
                type="text"
                name="options"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className={`${inputClass} flex-1`}
              />
              {options.length > MIN_OPTIONS && (
                <button type="button" onClick={() => removeOption(i)} className={buttonGhostClass}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <input type="hidden" name="correctIndex" value={correctIndex} />
        {options.length < MAX_OPTIONS && (
          <button type="button" onClick={addOption} className={`${buttonGhostClass} mt-2`}>
            + Add option
          </button>
        )}
        {state.fieldErrors?.options && <p className={errorTextClass}>{state.fieldErrors.options[0]}</p>}
        {state.fieldErrors?.correctIndex && (
          <p className={errorTextClass}>{state.fieldErrors.correctIndex[0]}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Explanation (optional)</label>
        <textarea
          name="explanation"
          defaultValue={question?.explanation ?? ""}
          rows={2}
          placeholder="Shown to students after they answer wrong."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Related topic (optional)</label>
          <select name="topicId" defaultValue={question?.topicId ?? ""} className={inputClass}>
            <option value="">None</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Order</label>
          <input name="order" type="number" defaultValue={question?.order ?? 0} className={inputClass} />
        </div>
      </div>

      {state.error && !state.fieldErrors && <p className={errorTextClass}>{state.error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? "Saving…" : question ? "Save changes" : "Add question"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isPending} className={buttonSecondaryClass}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}