# Feature: Topic Checklist & Weighted Progress

## What shipped
- Per-topic checklist (read / lecture / solved) on a new chapter detail page.
- Chapter % and subject % computed live, subject % weighted by `Chapter.examWeight`.
- "Mark chapter complete" → `ChapterMastery.status = AWAITING_QUIZ`.
- Dashboard shows per-chapter progress + mastery badge, subject-level progress bar.

## Key decisions
- **Chapter %** = checked boxes / (topics × 3), topics weighted equally (no per-topic weight in schema).
- **Subject %** = chapter % averaged, weighted by `examWeight`. Empty chapters count as 0%, not excluded.
- **Mark-complete is not gated** on 100% — quiz (Phase 5) is the real validator, per product plan.
- **`ChapterMastery` created lazily** on first checkbox toggle, not pre-seeded.
- **Status never downgrades** on checkbox toggle after `AWAITING_QUIZ`+; only `NOT_STARTED → IN_PROGRESS` is automatic.
- **Checkboxes stay editable after submission** (no hard lock) — revisit if this needs to change once quizzes land.
- **Re-submission blocked**: `markChapterComplete` throws `ChapterAlreadySubmittedError` if status is already past `IN_PROGRESS`.

## New/changed files
| File | Purpose |
|---|---|
| `lib/progress.ts` | Pure % calculators, no I/O |
| `lib/student-data.ts` | `getStudentDashboardData(trackId, studentId)` (signature changed), `getChapterDetail(chapterId, studentId, trackId)` |
| `schemas/topic-progress.ts`, `schemas/chapter-mastery.ts` | Zod validation |
| `actions/topic-progress.ts` | `toggleTopicProgress` |
| `actions/chapter-mastery.ts` | `markChapterComplete` |
| `lib/prisma-errors.ts` | + `ChapterAlreadySubmittedError` |
| `app/(student)/(app)/chapter/[chapterId]/page.tsx` | Chapter detail page (new route) |
| `components/student/{progress-bar,mastery-badge,topic-row,mark-complete-button}.tsx` | New UI |
| `components/student/subject-list.tsx` | Rewritten — takes `{ data }` not `{ track }` |

## Security
`getChapterDetail` verifies the chapter's `paper.subject.trackId` matches the student's own `trackId` — cross-track chapter access via URL id returns `notFound()`.

## QA status
All manual QA passed (checkbox toggle, full completion, mark-complete, reload persistence, cross-track access blocked, subject % math, zero-topic chapter edge case).

## Carried into Phase 5
Quiz engine will read `ChapterMastery.status = AWAITING_QUIZ` and transition to `MASTERED`/`NEEDS_REVIEW` against `Chapter.masteryPassPercent`.