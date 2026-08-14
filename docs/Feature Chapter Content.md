# Feature: Per-Chapter Content System

## Summary

Every chapter now exposes four content types to students: curated YouTube
playlists (with reviews), tagged special videos, student-uploaded notes,
and platform-authored official notes gated behind Pro access.

## Scope

- `ChapterPlaylist` + `PlaylistReview` — Admin/Manager CRUD, student
  browse + 1–5 star review (upsert, one per student per playlist)
- `ChapterSpecialVideo` — Admin/Manager CRUD with `SpecialVideoTag` enum,
  client-side tag-pill filter on the student view
- `OfficialNote` — Admin/Manager CRUD, `AccessType` (FREE/SUBSCRIPTION/
  BATCH_PURCHASE), gated by `hasProAccess()` (stub, always `false` until
  monetization work)
- `StudentNote` — student upload/edit, public/private toggle, Google
  Drive links only, automated link-accessibility check in place of
  manual moderation

## Access model

- Staff mutations: `requireRole(["ADMIN","MANAGER"])`, no `logAudit()`
  on `StudentNote` (student-initiated, out of audit scope by design)
- Staff mutations on Playlist/Video/OfficialNote: `logAudit()` inside
  the same `$transaction` as the mutation
- Student mutations: `requireUser()` + explicit track-ownership check
  against the chapter before any write

## Automated Drive-link check (replaces manual moderation)

`lib/drive-link-check.ts` — `checkGoogleDriveLinkPublic(url)` fetches the
link unauthenticated and classifies it:

- `PRIVATE` — 401/403 response, or redirected to `accounts.google.com`,
  or an HTML "request access" page → save is blocked with a field error
- `PUBLIC` — 2xx with no access-restriction signal → save proceeds,
  `moderationStatus` set to `APPROVED` automatically
- `UNKNOWN` — network error, timeout, or inconclusive response → save
  proceeds (fails open, not closed)

Triggered on: note creation with `isPublic=true`, editing the link on an
already-public note, and toggling private → public. Never triggered on
private notes or on edits that don't touch a public note's link.

`moderationStatus` remains in the schema and still gates public
visibility (`isPublic && moderationStatus === APPROVED`), but is now set
automatically rather than by a human reviewer. No Manager moderation
queue exists for notes.

## Known deviation from the original product plan

The product plan (content model section) called for manual Manager
approval before a student note goes public, specifically to catch spam,
duplicates, or off-topic uploads. That's been replaced with the
automated link check, which only verifies the link opens — it has no
signal on content quality or relevance. That risk is currently
unmitigated and is expected to be addressed by the anti-spam point-rule
work planned for the gamification/points milestone.

## Schema fixes bundled into this work

- `youtubeUrl` and Google-Drive URL Zod refinements were substring
  matches on the raw URL (`url.includes("drive.google.com")`), which a
  crafted URL could bypass (e.g. `evil.com/?x=drive.google.com`). Both
  now parse the actual hostname and allow-list it explicitly.

## Shared UI pattern

Playlists, special videos, and official notes all reuse the same
flow: search input -> `ChapterPickerList` -> `/manager/<feature>/[chapterId]`
detail page. New content types should follow this same picker shape
rather than introducing a new navigation pattern.

## QA status

Full pass completed — upload/edit/visibility-toggle paths, Drive-link
accessibility gating (including a live 401 case), cross-student and
cross-track access checks, and public/private note visibility on the
chapter page. All cases passed.

## Out of scope / deferred

- `pointsAwarded` on `StudentNote` stays `false` — wiring happens with
  the points engine
- Note-upload caps / anti-spam rules — deferred to the same points-engine
  work
- `hasProAccess()` real implementation — deferred to monetization work
