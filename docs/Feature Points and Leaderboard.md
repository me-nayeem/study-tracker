# Feature — Points Engine + Leaderboards

## Overview

Single choke-point points engine (`awardPoints()`) retrofitted into every
point-earning action from feature 4–5, plus an atomic `LeaderboardSnapshot`
upsert on every award. Admin-configurable via `PointRule` CRUD. Student-
facing `MASTER_SCORE` leaderboard live; `STUDY_TIME` leaderboard UI built
but empty until feature 8 (`StudySession`) supplies data.

## Schema additions

- `PointRule.secondaryValue` (`Float?`) — enables tiered point values for
  a single `PointReason`. Currently only `NOTE_UPLOADED` uses it (10 pts
  first note per chapter, 3 pts each subsequent note in that chapter).
  `null` for every other reason.

## Seeded `PointRule` defaults (`prisma/seed.ts`)

| Reason                 | Mode       | value                         | secondaryValue |
| ---------------------- | ---------- | ----------------------------- | -------------- |
| `CHAPTER_MASTERED`     | PER_WEIGHT | 10                            | —              |
| `QUIZ_ATTEMPT`         | PER_MARK   | 1                             | —              |
| `EXTERNAL_EXAM_RESULT` | PER_MARK   | 1                             | —              |
| `NOTE_UPLOADED`        | FLAT       | 10                            | 3              |
| `STREAK_BONUS`         | FLAT       | 1                             | —              |
| `PLAYLIST_REVIEWED`    | FLAT       | 5                             | —              |
| `MANUAL_ADJUSTMENT`    | — no row — | bypasses `PointRule` entirely |                |

`npx prisma db seed` required explicitly (Prisma 7 doesn't auto-seed after
`migrate dev`). Seed config lives in `prisma.config.ts`'s
`migrations.seed`, not `package.json`.

## `lib/points.ts` — the engine

- `awardPoints(tx, { studentId, reason, referenceId, quantity?, useSecondaryValue? })`
  — reads the active `PointRule`, applies `scoringMode` (FLAT / PER_MARK /
  PER_WEIGHT), writes `PointTransaction`, increments
  `StudentProfile.totalPoints`, and upserts all four `MASTER_SCORE`
  `LeaderboardSnapshot` rows (DAILY/WEEKLY/MONTHLY/ALL_TIME) — atomically,
  inside the caller's transaction.
- **Inactive/missing rule → silent no-op (returns 0).** The underlying
  action (mastery, upload, review) always succeeds regardless of rule state.
- `manualAdjustPoints(tx, { studentId, points, referenceId? })` — separate
  function for `MANUAL_ADJUSTMENT`, bypasses `PointRule` lookup entirely
  per schema comment, still flows through the same snapshot upsert so
  `totalPoints` and `LeaderboardSnapshot` never drift apart.

## `lib/period-key.ts` — periodKey computation

- Timezone: **Asia/Dhaka** (UTC+6, no DST — safe without a date library).
- `WEEKLY` starts **Sunday** (matches `StudyRoutineItem.dayOfWeek` convention).
- `WEEKLY` periodKey is the **literal date of that week's Sunday**
  (e.g. `"2026-07-26"`), not an ISO week number — avoids Mon-start vs.
  Sun-start ambiguity and year-boundary edge cases.
- `DAILY`: `"2026-07-26"`, `MONTHLY`: `"2026-07"`, `ALL_TIME`: `"ALL"`.

## Retrofits (Step 3)

- `actions/quiz-attempt.ts` — `QUIZ_ATTEMPT` on every attempt
  (`quantity: correctCount`, raw score not percentage); `CHAPTER_MASTERED`
  additionally on pass (`quantity: chapter.examWeight`).
- `actions/student-notes.ts` — `createStudentNote` wrapped in
  `$transaction` (previously wasn't); `NOTE_UPLOADED` awarded immediately
  on upload regardless of moderation status; `useSecondaryValue` = true
  when the student already has _any_ note (including rejected ones) in
  that chapter — full-value slot can't be re-earned by uploading spam,
  getting it rejected, then uploading a real note.
- `actions/content.ts` (`submitPlaylistReview`) — wrapped in
  `$transaction` (previously wasn't); `PLAYLIST_REVIEWED` awarded only on
  the _first_ review of a playlist by a student, not on edits (the
  `upsert`'s `update` path skips the award).

## Admin — `PointRule` management

- `(staff)/admin/point-rules` — edit-only (create handled by seed script).
  Inline per-row edit: `value`, `secondaryValue` (shown only for
  `NOTE_UPLOADED`), `isActive` toggle. `AuditLog` on every update.

## Student — Leaderboard

- `/leaderboard` — `MASTER_SCORE` / `STUDY_TIME` metric tabs,
  DAILY/WEEKLY/MONTHLY/ALL_TIME period tabs.
- Top 100 entries max, 25/page pagination, scoped to student's `trackId`.
- `RankCard` — student's own rank (or "Not ranked yet" if no snapshot row
  for that period) + points, pinned above the table.
- Track's total student count shown alongside pagination info.
- Real names (`User.name`) shown; current student's row highlighted.
- `STUDY_TIME` tab renders a "coming soon" empty state

## Bugs fixed

- **Checkbox/hidden-input DOM order** (`point-rule-row.tsx`) — hidden
  fallback (`isActive=false`) was placed before the checkbox, so
  `FormData.get()` always returned the first match regardless of checkbox
  state. Reordered: checkbox first, hidden fallback second.
- **`setState` inside `useEffect`** (same file) — React 19 purity rule
  flagged closing the edit form via effect-triggered `setState`. Replaced
  with the render-time `prevState` comparison pattern (React's documented
  "adjust state when something changes" approach) instead of an effect.

## Definition of done (workflow.md, met)

Every point-earning action updates `totalPoints` and all relevant
`LeaderboardSnapshot` rows in the same transaction; admin can edit a
`PointRule` and see the new value reflected on the next award.
