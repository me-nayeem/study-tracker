# Feature: Student UI Redesign & New Content Features

Covers the student-facing redesign pass and the new features shipped alongside it: Tips & Tricks, playlist videos + watch page, community notes social feed, topic-wise placeholders, and the mobile-first layout overhaul.

---

## 1. Layout & Navigation

**Desktop sidebar** (`student-sidebar.tsx`, `student-shell.tsx`)

- Fixed positioning, collapsible to an icon-only rail (persisted via `useSyncExternalStore` + `localStorage`, key `student-sidebar-collapsed`).
- Collapse toggle lives inside the sidebar header (desktop only).

**Mobile bottom nav** (`components/student/bottom-nav.tsx`)

- 5 items: Dashboard, Lectures, Leaderboard, Results, Profile — `md:hidden`, fixed to viewport bottom.
- Sidebar becomes a slide-in drawer on mobile (hamburger in topbar), still holds Routine + Sign out.
- `FloatingCalculator` repositioned to `bottom-20 md:bottom-6` to clear the bottom nav bar.

**Topbar** (`student-topbar.tsx`)

- Logo left, Free/Pro badge + clickable profile avatar right → `/account`.
- Avatar uses Google OAuth `user.image` via `next/image` (requires `lh3.googleusercontent.com` in `next.config.ts` `images.remotePatterns`).

**Account page** (`/account`)

- Editable: `User.name`, `StudentProfile.board`/`institutionName`/`phoneNumber`. Read-only: `email`, `trackId`.
- On save, calls `useSession().update()` + `router.refresh()` — required because NextAuth v4 JWT strategy caches `name` in the session cookie; `lib/auth.ts`'s `jwt` callback was extended with a `trigger === "update"` branch to support this.

## 2. Color System

Added to `globals.css`, additive to the existing palette (nothing removed):

```
--accent-blue, --accent-purple, --accent-red, --accent-teal
```

Used for deterministic per-item color cycling (subject cards, chapter tab tiles, chapter card icons, playlist/note cover banners) so the UI isn't monotone terracotta. `--accent-primary` stays reserved for primary actions (buttons, links).

## 3. Dashboard (`/dashboard`)

- `StatsHeader` — Level / Points / Streak, from `StudentProfile` (Phase 6 data, previously unshown).
- `SubjectList` — 2-column grid (desktop), 1-column (mobile). Each subject card: icon tile (cycled color) + progress bar + paper buttons (`flex-1` each, so 1 paper = 100% width, 2 papers = 50/50).

## 4. Paper Page (`/paper/[paperId]`)

New route. Lists a single paper's chapters as `ChapterCard`s: icon (keyword-matched against chapter name, e.g. "organic" → flask), circular progress ring, mastery badge, "Read" pill. Whole card is one `<Link>` — clicking anywhere navigates identically. Ownership-checked against `trackId`.

## 5. Chapter Page (`/chapter/[chapterId]`)

**Tabs** (`ChapterTabs`) — icon-tile grid (not pill nav, which didn't wrap well on mobile): Lectures, Exam, Checklist, Notes, Special, Tips & Tricks. Mark Complete / quiz-link moved to top-right of the header.

**Checklist tab** — each topic is a card with a done-count badge and pill-style toggles (Read / Watched lecture / Solved problems); card gets a green tint when all three are done. Logic unchanged from original `TopicRow`, styling only.

**Exam tab** (new) — lists the chapter's topics as colored cards, each with Video + Exam buttons → `/topic/[id]/video` and `/topic/[id]/exam`, both currently "Coming soon" placeholders (ownership-checked). Intended future wiring: Video → `Resource` model; Exam → `ExternalExam` link (Phase 7, deferred).

**Notes tab** — 3 color-coded cards: Official Notes (purple), Community Notes (teal, links to `/notes` feed), My Notes (gold, upload/edit/visibility toggle).

**Special tab** — `ChapterSpecialVideo` entries as colored icon-cards, filterable by tag (One-shot/Admission/Motivation/Trick/Other, each with a distinct color+icon). Clicking a card opens `/special/[videoId]` — a watch page with a main player (YouTube embed if the URL is YouTube, external-link fallback otherwise) + sibling rail of the chapter's other Special videos.

## 6. Tips & Tricks (new feature, new schema)

**Schema:**

```prisma
enum TipCategory { LAW SHORTCUT CALCULATOR_HACK }

model ChapterTip {
  id, chapterId, category, title
  youtubeUrl String?   // SHORTCUT, CALCULATOR_HACK
  driveLink  String?   // LAW, SHORTCUT
  order, isArchived, addedByUserId, createdAt
}
```

- `LAW` requires `driveLink` only; `CALCULATOR_HACK` requires `youtubeUrl` only; `SHORTCUT` requires both — enforced via Zod `.refine()`.
- Student view (`TipsSection`) groups by category, embeds YouTube videos inline (`YoutubeEmbed`, `youtube-nocookie.com`), Drive links open in a new tab via a "View" button.
- Manager CRUD at `/manager/tips` → `/manager/tips/[chapterId]`, follows the `EntityForm` pattern exactly (`TipForm`, `TipManager`).

## 7. Lectures (Playlists + Videos)

**Schema additions:**

```prisma
model ChapterPlaylist {
  // existing fields...
  channelUrl String?
  videos     ChapterPlaylistVideo[]
}

model ChapterPlaylistVideo {
  id, playlistId, title, youtubeUrl, order, isArchived, addedByUserId, createdAt
}
```

- Manager can now add individual videos under a playlist (sub-section inside the playlist edit form) — Option B (manual curation) chosen over the YouTube Data API to avoid quota/infra risk.
- **Playlist card** (chapter Lectures tab) — FB-post style: colored cover banner, title, avg rating badge, Channel button (bell icon, links to `channelUrl`), Review popover (star rating + optional comment, one per student per playlist via `PlaylistReview`), View button, and a comment feed below (4 shown by default, "Load more" adds 6 at a time) sourced from `PlaylistReview.comment`.
- **Watch page** (`/playlist/[playlistId]`) — main embedded player + suggestion rail (thumbnail list of the playlist's other videos, click to swap). Responsive: stacked on mobile, side rail (`lg:w-80`) on desktop.
- **Lectures index** (`/lectures`, new bottom-nav destination) — track-wide playlist search: cascading Subject → Paper → Chapter filters + text search (debounced, URL-param driven), compact result rows (not full cards, since this list can be long).

Shared: `extractYoutubeId` / `isYoutubeUrl` now live in `youtube-embed.tsx` and are imported wherever needed (playlist watch, special-video watch) instead of being duplicated per file.

## 8. Community Notes (new feature, new schema)

**Schema additions:**

```prisma
model StudentNoteLike    { id, noteId, studentId, createdAt }              // unique(noteId, studentId)
model StudentNoteRating  { id, noteId, studentId, rating, createdAt, updatedAt } // unique(noteId, studentId), 1–5, no comment field
model StudentNoteComment { id, noteId, studentId, body, createdAt, updatedAt }
```

- Self-like/self-rate blocked (`isOwn` check in the action); self-comment allowed.
- Ranking: `score = likeCount + ratingCount`, no gamification/points tie-in (explicitly out of scope).
- Track-scoped: `getPublicNotesFeed(trackId, viewerStudentId, chapterId?)`.
- **Feed page** (`/notes`) — FB-post style cards (`NoteFeedCard`): colored cover banner, author avatar (deterministic color per name), avg-rating badge, Like/Rate/View action bar, comments below (3 shown by default, own comments editable/deletable inline).
- Rating and Like popovers use a **fixed, viewport-centered backdrop** (not button-anchored `absolute` positioning) to avoid clipping on narrow mobile screens — this was a real bug fix, not just styling (both `PlaylistReviewPopover` and `NoteFeedCard`'s rate popover were affected and fixed the same way).
- Chapter page's "Community notes" card links here via `/notes?chapterId=X`.

## 9. Leaderboard (`/leaderboard`)

- `RankCard` — trophy icon tile, gold gradient/glow when the viewing student is top-3.
- `LeaderboardTable` — ranks 1–3 (page 1 only) render as podium cards (crown/medal icons, gold/silver/bronze coloring); ranks 4+ stay in the compact list. Viewing student's entry always visibly highlighted (ring on podium, tinted+bold row in the list).
- All data-fetching, period/metric toggle, and pagination logic unchanged — visual-only pass.

## 10. Quiz Results (`/quiz-results`)

- Each result is a status-tinted card (green = Mastered, warning-red = Needs review) with a circular percent ring (falls back to a plain icon badge if no attempt score exists yet).
- Retake is now a filled button; wrong-answer review list keeps its expand/collapse, chevron rotates on toggle. No logic changes.

---

## Known placeholders / explicitly deferred

- `/topic/[id]/video` and `/topic/[id]/exam` — both "Coming soon," ownership-checked, ready to wire once `Resource` (video) and `ExternalExam` (Phase 7) data exist.
- Special tab's "5-item" future redesign (topic-wise exam, topic-wise video, special suggestion, highlighted book, previous-years CQ/MCQ drive links) — only the existing tag-based `ChapterSpecialVideo` view was redesigned; the new 5-item version is unbuilt, deferred per earlier discussion.
- Study-time leaderboard — still shows "Coming soon" (unchanged, pre-existing).
