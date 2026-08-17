# Feature — Contact/Feedback pages, Streak, Level-Up, PWA Install

## Contact & Feedback
- `/contact` — reuses `DEVELOPERS` from `lib/developers.ts`, static info only.
- `/feedback` — form (category: BUG/SUGGESTION/GENERAL + message) → new
  `Feedback` model. Success shows a modal, then navigates to `/dashboard`.
- Manager/Admin view at `/manager/feedback` — filter by reviewed status,
  paginated, "mark reviewed" writes to `AuditLog`.
- Both added to `STUDENT_NAV`; `Feedback` added to `AUDIT_ENTITY_TYPES`.

## Streak system (reworked)
- Decoupled entirely from `StudySession` (timer feature unlaunched) — a
  streak day is now simply visiting `/dashboard`.
- `lib/streaks.ts` → `evaluateStreak()`, idempotent per Dhaka-calendar day
  via `StudentProfile.lastActiveAt`. First visit of the day: continues or
  resets `streakCount`, awards flat `STREAK_BONUS` point.
- `StreakCelebrationModal` shown only when a new day is actually recorded.

## Level-up
- `StudentProfile.level` now updates silently on every point award
  (`lib/points.ts`'s `syncLevel()`, called from `awardPoints()` and
  `manualAdjustPoints()`) — no popup at award time, regardless of source
  (note upload, quiz, chapter mastery, manual adjustment).
- New `StudentProfile.lastShownLevel` tracks what the student has actually
  *seen*. Dashboard visit compares `level > lastShownLevel` → shows
  level-up modal, then syncs `lastShownLevel`.
- Priority when both streak and level-up are due same visit: **level-up
  shows, streak deferred to next visit** (streak recurs daily regardless;
  level-up is the rarer event).

## PWA install prompt
- `app/manifest.ts` + minimal `public/sw.js` (installability only, no
  offline caching yet).
- `PwaInstallController` — Android/Chrome uses real `beforeinstallprompt`
  capture; iOS gets manual Share-sheet instructions (no JS install API
  exists on iOS, by platform design). `pwaInstalled` only ever set via
  actual observed standalone mode or a confirmed native install outcome —
  never from a self-reported button click.
- `StudentProfile.pwaInstalled` / `pwaInstallDismissedAt` — 2-day
  reappear cooldown if dismissed, permanent stop once genuinely installed.
- Suppressed on any visit where the streak or level-up modal is showing.

## Modal priority on `/dashboard` (final order)
1. Level-up (if `level > lastShownLevel`)
2. Streak (if not already visited today) — only if level-up isn't showing
3. PWA install prompt — only if neither of the above is showing

## Schema additions
- `Feedback` model + `FeedbackCategory` enum
- `StudentProfile.pwaInstalled`, `pwaInstallDismissedAt`, `lastShownLevel`