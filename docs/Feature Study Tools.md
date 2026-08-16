# Feature: Study Tools (partial)

## Status: infrastructure + streaks live; routine builder & timer UI not shipped

Backend for `StudySession` tracking and the leaderboard/streak systems it
feeds is complete and deployed. The student-facing timer widget, the
`StudyRoutine` builder, and `TodoItem` UI were **not built** — routine
builder was built once, then deliberately shelved behind a "Coming soon"
placeholder before launch. Streak logic was reworked to decouple
entirely from `StudySession`, since the timer feature won't ship yet.

## Schema additions

- `TodoItem.sourceRoutineItemId` (`String?`, `onDelete: SetNull`) + reverse
  relation on `StudyRoutineItem` — lets the nightly routine→todo cron
  upsert idempotently via `@@unique([sourceRoutineItemId, dueDate])`
  instead of fragile text-matching. Currently unused in practice since the
  routine builder isn't live, but the constraint means it's safe the
  moment it is.

## What's live

### `StudySession` timer backend (`actions/study-sessions.ts`)

- `startStudySession` / `heartbeatStudySession` / `pauseStudySession` /
  `resumeStudySession` / `endStudySession` — full lifecycle, callable as
  plain async Server Actions (not form-bound, since a client timer calls
  these programmatically on an interval, not via `<form>` submission).
- **Time crediting is incremental, not computed once at the end** — every
  heartbeat/pause/end call credits only the delta since the last
  heartbeat, both to `StudySession.durationSeconds` and to the
  `STUDY_TIME` leaderboard snapshot (`lib/study-time.ts`), in the same
  transaction. Any single delta is capped at 8 minutes
  (`MAX_HEARTBEAT_GAP_SECONDS`) so a sleeping laptop can't silently credit
  hours of "study time."
- A student can only have one `ACTIVE`/`PAUSED` session at a time —
  enforced in `startStudySession`.
- **No UI consumes these actions yet.** Built and tested at the action
  layer only; there is no timer widget for a student to actually start a
  session from.

### Abandon-session handling — hybrid design (Hobby-plan constraint)

Vercel's Hobby plan only allows once-daily cron schedules; a frequent
sweep (e.g. every 4 minutes) fails at deploy time. Two-part solution:

- **Lazy reclaim** (`lib/session-abandon.ts`, called from
  `startStudySession`): if a student's existing `ACTIVE` session is stale
  (`lastHeartbeatAt` older than 8 minutes) when they try to start a new
  one, it's reclaimed (`status: ABANDONED`, `endedAt: lastHeartbeatAt`)
  right there instead of blocking them.
- **Daily safety-net cron** (`app/api/cron/abandon-sessions/route.ts`,
  `0 20 * * *` UTC = 2 AM Dhaka): catches students who never return to
  start a new session. **Change the schedule to `*/4 * * * *` once on
  Vercel Pro** — no code change needed, just the `vercel.json` cadence.
- Both paths share `isStale()`/`abandonSession()` from the same module —
  one definition of "stale," no drift between the two triggers.

### Streak system — reworked, decoupled from StudySession

**Original design** (streak day = completed `StudySession`) was replaced
mid-feature once the timer/routine features were deferred — a streak tied to
an unlaunched feature would never fire.

**Current design:** streak day = **visiting `/dashboard`**, once per
Dhaka-calendar day.

- `lib/streaks.ts` → `evaluateStreak(tx, studentId, now)` — idempotent per
  day via `StudentProfile.lastActiveAt` (compared via
  `lib/period-key.ts`'s `getDailyKey()`, so repeat visits the same day are
  a silent no-op: `{ awarded: false }`).
- Continuing yesterday's streak → `streakCount += 1`. Any gap → reset to
  `1`. Either way, the _first_ visit of the day awards flat `STREAK_BONUS`
  (1 point, locked in feature 6's `PointRule` seed) via the same
  `awardPoints()` choke point everything else uses.
- Called directly from `app/(student)/(app)/dashboard/page.tsx`, alongside
  the existing dashboard data fetches — no separate endpoint or cron.
- `StreakCelebrationModal` renders **only** when `streakResult.awarded` is
  true (i.e. genuinely the first visit that day) — shows streak count,
  points earned, and a rotating motivational line. Dismissable overlay.
- `StatsHeader` is fed `profile.totalPoints + streakResult.pointsAwarded`
  and `streakResult.streakCount` (not the raw `profile` values), so the
  header never shows a stale number for the render where the award just
  happened.

### `STUDY_TIME` leaderboard

Already had UI shell from feature 6 (empty-state placeholder). Now has a
real data source (`addStudyTimeSeconds` in `lib/study-time.ts`, same
DAILY/WEEKLY/MONTHLY/ALL_TIME snapshot pattern as `MASTER_SCORE`) — but
since no timer UI exists yet for students to generate sessions, it will
show empty in practice until the timer widget ships.

### Nightly routine→todo generation cron

`app/api/cron/generate-routine-todos/route.ts` (`0 18 * * *` UTC =
midnight Dhaka) — fully built, deployed, and **dormant**: since the
routine builder UI was shelved, no `StudyRoutine`/`StudyRoutineItem` rows
exist for any student, so this runs nightly and no-ops (0 candidates,
0 created). Reconnects automatically the moment the routine builder ships
— no code changes needed, just remove the placeholder page.

## What's shelved

- `app/(student)/(app)/routine/page.tsx` — full builder (create routine,
  add/edit/delete time blocks per day, activate/deactivate) was built,
  then replaced with a static "Coming soon" page ahead of launch. Backend
  (`actions/study-routine.ts`, `lib/study-routine-data.ts`,
  `schemas/study-routine.ts`, all routine components) remains in the
  codebase, untouched, ready to swap back in.
- Student-facing study timer widget — not built.
- `TodoItem` UI (manual creation + viewing generated todos) — not built.

## Bugs fixed this feature (unrelated, surfaced during this Feature work)

- `Youtube` icon import from `lucide-react` — not exported in the
  installed version (brand/logo icons generally aren't in this library's
  scope at all, not a version-specific gap). Replaced with a custom
  `YoutubeIcon` SVG component (`components/shared/icons/youtube-icon.tsx`)
  using `currentColor`, drop-in compatible with existing className usage.

## Open items carried forward

- Timer widget UI, `TodoItem` UI — whenever picked back up.
- `StudyRoutine` launch — swap placeholder page back for the real one;
  everything else (actions, cron, schema) is already live and waiting.
- Push notifications for abandoned sessions — explicitly scoped **out**
  of this feature; would need new infrastructure (Web Push + service
  worker, or a third-party push service). Backlog item, not started.
- `vercel.json` `abandon-sessions` cadence — currently once-daily
  (Hobby-plan constraint); tighten to `*/4 * * * *` once on Pro.
