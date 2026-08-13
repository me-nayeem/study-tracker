# Feature — Quiz / Auto-Validation Engine

## Overview
Automated quiz gating on chapter completion. A chapter marked complete
(`AWAITING_QUIZ`) fires its active `Quiz`; the score against
`Chapter.masteryPassPercent` determines `MASTERED` vs `NEEDS_REVIEW`.
Failed students face a 1-hour cooldown before retaking.

## Schema additions
- `QuizQuestion.topicId` (optional, `onDelete: SetNull`) — links a question
  back to the specific `Topic` it tests, so a wrong answer can be traced to
  a weak spot below chapter granularity.
- `Topic.quizQuestions` — reverse relation for the above.
- `NotificationType.CHAPTER_NEEDS_REVIEW` — new enum value for the
  needs-review notification trigger 
## Admin/Manager (Content ops)
- `(staff)/manager/quizzes` — list of chapters with quiz status
- `(staff)/manager/quizzes/[chapterId]` — CRUD for `Quiz` + `QuizQuestion`
  (question text, 4 options as `Json`, `correctIndex`, optional
  `explanation`, optional `topicId` tag, `order`)
- `components/staff/content/quiz-manager.tsx`,
  `quiz-question-form.tsx`

## Student flow
1. `mark-complete-button.tsx` flips `ChapterMastery.status` →
   `AWAITING_QUIZ` (`actions/chapter-mastery.ts`)
2. `/chapter/[chapterId]/quiz` (`app/(student)/(app)/chapter/[chapterId]/quiz/page.tsx`)
   - Guards: `AWAITING_QUIZ` or `NEEDS_REVIEW` only; anything else → `notFound()`
   - `NEEDS_REVIEW` path: `getQuizCooldown()` (`lib/quiz-data.ts`) checks
     time since last `QuizAttempt` for this `chapterMasteryId`; if within
     1 hour, shows `minutesLeft` remaining instead of the quiz
   - Otherwise renders `getActiveQuizForChapter()` via
     `components/student/quiz-taking-form.tsx`
3. Submission (`actions/quiz-attempt.ts`) — scores against
   `correctIndex`, creates `QuizAttempt` (`score`, `totalQuestions`,
   `answers` snapshot), compares `score/totalQuestions*100` to
   `Chapter.masteryPassPercent`:
   - Pass → `ChapterMastery.status = MASTERED`, `masteredAt` set
   - Fail → `ChapterMastery.status = NEEDS_REVIEW`,
     `CHAPTER_NEEDS_REVIEW` notification created
4. `/quiz-results` — `quiz-results-list.tsx` reads `QuizAttempt.answers`
   joined against `QuizQuestion.topicId`, tallies wrong answers per topic,
   and surfaces a per-topic breakdown (`failed-quiz-notice-board.tsx` for
   the needs-review state) — same underlying mechanism the product plan
   describes for external-exam breakdowns (§4, step 6), applied here to
   the in-app quiz.
5. `mastery-badge.tsx` reflects current `MasteryStatus` on chapter/dashboard views.


## Bugs fixed
- `Cannot call impure function during render` — `Date.now()` was called
  inline in `quiz/page.tsx`'s render body. Moved the calculation into
  `getQuizCooldown()` (an async server data function), which now returns
  `minutesLeft` pre-computed rather than the page deriving it during render.

## Definition of done (workflow.md, met)
Check topics → mark complete → quiz → MASTERED/NEEDS_REVIEW, full loop,
plus topic-level breakdown on failure and a working 1-hour retake gate.