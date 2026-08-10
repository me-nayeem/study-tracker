# Feature: Student Dashboard

## Overview

Covers everything a student sees between first sign-in and landing on their
dashboard: onboarding, track assignment, and the initial curriculum view.
Every downstream student feature (progress tracking, quizzes, exams,
leaderboards) is layered on top of the `StudentProfile` created here.

## Route Structure

```
app/(student)/
├── layout.tsx                 → requireUser() only
├── onboarding/
│   └── page.tsx                → redirects to /dashboard if a profile
│                                  already exists; otherwise renders the
│                                  onboarding form
└── (app)/                      → route group, no URL segment
    ├── layout.tsx               → requireUser() + requires a StudentProfile
    │                              (redirects to /onboarding if missing) →
    │                              renders StudentShell
    └── dashboard/
        └── page.tsx             → subject/paper/chapter list for the
                                     student's Track
```

Two layout layers exist because onboarding cannot itself be gated behind
"must have a `StudentProfile`" — that's precisely the condition it creates.
Any account, student or promoted staff, can reach `/dashboard`; there is no
role restriction on this route group.

## Onboarding

**Fields collected:** `level`, `group` (required, drive track matching),
`institutionName` and `phoneNumber` (required — phone is needed later for
external exam result matching), `board` (optional).

**Phone format:** local Bangladeshi mobile format, validated as
`01[3-9]\d{8}` (11 digits, e.g. `01712345678`). `StudentProfile.phoneNumber`
is unique; a duplicate submission surfaces a clean "already exists" error
rather than a raw database error.

**Flow (`completeOnboarding` Server Action):**
1. Reject if the user already has a `StudentProfile` (redirect to dashboard).
2. Validate input via `OnboardingSchema` (Zod).
3. Resolve a `Track` via the matching rule below.
4. Create the `StudentProfile`.
5. Redirect to `/dashboard`.

Onboarding is a self-service student action and is intentionally **not**
written to the audit log — `AuditLog` is scoped to staff mutations only.

## Track Matching

`matchTrackForLevelGroup(level, group)` resolves which `Track` a new
student is assigned to:

```
1. Candidates = Track where level, group match and isArchived = false
2. Prefer the candidate with the soonest future examDate (>= today), ascending
3. If none have a future examDate, fall back to the highest batchYear
4. batchYear (descending) breaks any remaining tie
5. If no candidates exist at all, onboarding surfaces a
   "no track available for this level/group yet" error instead of failing
```

Track assignment happens **once**, at onboarding. It is a stored foreign
key (`StudentProfile.trackId`), not re-evaluated afterward — adding a new,
better-matching `Track` later does not move already-onboarded students.

## Dashboard Data

`getStudentDashboardData(trackId)` returns the student's `Track` with its
curriculum tree:

```
Track → Subjects → Papers → Chapters
```

`isArchived: false` is applied at every level (`Subject`, `Paper`,
`Chapter`) — this is a deliberately separate query from the Admin
curriculum tree, which intentionally includes archived records for
restoration purposes. Reusing the Admin query here would leak archived
content to students.

Topics are not fetched on the dashboard; they belong to the chapter detail
page (progress tracking, out of scope for this feature).

## UI

- `StudentShell` / `StudentSidebar` / `StudentTopbar` — structural mirror
  of the staff shell (mobile drawer, `animate-card-in` page transition),
  themed identically, navigated via a flat `STUDENT_NAV` list
  (`lib/nav-config.ts`).
- `OnboardingForm` and `SubjectList` use shared primitives from
  `components/shared/classes.ts` (`inputClass`, `labelClass`,
  `errorTextClass`, `buttonPrimaryClass`) rather than ad hoc Tailwind
  strings, keeping form/button styling consistent with the staff side.
- Empty states are explicit at every level: no subjects, no papers, and no
  chapters each render a distinct message rather than an empty list.

## File Reference

| Path                                             | Purpose                                    |
|---------------------------------------------------|----------------------------------------------|
| `lib/track-matching.ts`                           | `matchTrackForLevelGroup` — track assignment rule |
| `lib/student-data.ts`                             | `getStudentProfile`, `getStudentDashboardData` |
| `schemas/onboarding.ts`                           | Zod validation for onboarding input        |
| `actions/onboarding.ts`                           | `completeOnboarding` Server Action         |
| `app/(student)/layout.tsx`                        | Base student gate (`requireUser` only)     |
| `app/(student)/onboarding/page.tsx`               | Onboarding page + already-onboarded redirect |
| `app/(student)/(app)/layout.tsx`                  | Profile gate + `StudentShell`              |
| `app/(student)/(app)/dashboard/page.tsx`          | Dashboard page                             |
| `components/student/onboarding-form.tsx`          | Onboarding form UI                         |
| `components/student/subject-list.tsx`             | Subject → paper → chapter tree UI          |
| `components/student/student-shell.tsx`, `student-sidebar.tsx`, `student-topbar.tsx` | Student layout shell |
| `components/shared/classes.ts`                    | Shared form/button style primitives        |

## Known Limitations / Follow-ups

- Track re-matching is not automatic; if this becomes a problem in
  practice, it needs an explicit Admin-triggered re-match action rather
  than silent reassignment.
- Phone number format is locked to local BD format (`01XXXXXXXXX`). This
  must match whatever format the external exam provider sends in its
  webhook payload (Phase 7) — not yet verified against the provider's
  actual API.