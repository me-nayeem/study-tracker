# Oggrogoti: HSC Smart Study Tracker

A one-stop study companion for HSC and SSC students. For every chapter it brings together curated free content, notes, real exam evaluation with a genuine weakness breakdown, planning tools, and a leaderboard, instead of scattering them across notebooks, YouTube, group chats, and separate test platforms.

**Live:** https://study-tracker-brown-pi.vercel.app

---

## Table of Contents

- [Features](#features)
- [Roles](#roles)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Authentication and Authorization](#authentication-and-authorization)
- [Design System](#design-system)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Features

**Curriculum and progress**
- Curriculum tree: Track → Subject → Paper → Chapter → Topic
- Per-topic checklist (read, watched lecture, solved problems)
- Weighted progress bars driven by each chapter's exam weight
- Chapter completion triggers an automatic validation quiz that resolves to Mastered or Needs Review

**Per-chapter content**
- Curated free YouTube playlists with on-site student reviews and ratings
- Tagged special videos (one-shot, admission, motivation, trick)
- Student-uploaded notes with a public/private toggle and manager moderation
- Official premium notes (Pro)

**Evaluation**
- Chapter-wise external exams with a per-topic breakdown (free)
- Topic-wise external exams (Pro)
- Phone-number-matched results with a manual reconciliation path for unmatched records

**Planning and gamification**
- Weekly routine builder, to-do list, and study timer
- Weighted point scoring (base value × chapter weight)
- Study-time leaderboard and composite master leaderboard

**Operations**
- Admin and Manager panels with role-based access
- Full audit log of every staff mutation

---

## Roles

| Role | Responsibilities |
|---|---|
| **Student** | Study tracking, content, notes, quizzes, exams, planning, leaderboards |
| **Manager** | Playlists, special videos, official notes, note moderation, first-pass exam result reconciliation, student support |
| **Admin** | Everything a Manager can do, plus curriculum structure, chapter weights, role management, pricing, point rules, final dispute resolution, and the audit log |

Every user signs in through the same flow and starts as a Student. Manager and Admin accounts are existing users promoted by an Admin. The first Admin is bootstrapped through the seed script or a one-off database update.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React, TypeScript |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Database | Supabase PostgreSQL |
| Auth | NextAuth v4 (JWT strategy), Google and Email OTP providers |
| Validation | Zod |
| File storage | Cloudflare R2 (S3-compatible, presigned URLs) |
| Email | Resend |
| Rate limiting | Upstash Redis (sliding window) |
| Styling | Tailwind CSS with design tokens |
| Deployment | Vercel |

---

## Architecture Overview

- **Server Actions** handle all mutations. Each validates input with Zod, runs inside a Prisma transaction where needed, and returns a typed `ActionState`. Prisma errors are normalized through `handlePrismaError()`.
- **Authorization is layered.** `proxy.ts` performs an optimistic, cookie-only role check on `/admin` and `/manager`. The authoritative checks live in `lib/dal.ts` (`requireUser`, `requireRole`) and are called directly in every protected Server Action and page.
- **Audit trail.** Every staff mutation writes an `AuditLog` row through `logAudit()` in the same transaction as the change.
- **Soft deletes.** Curriculum entities use `isArchived`; users use `isActive`.
- **Data layer.** Read queries live in `lib/*-data.ts` files marked `server-only`.
- **Connections.** Runtime queries go through the Supabase transaction pooler. Migrations use the session pooler.

---

## Project Structure

```
src/
├── actions/              Server Actions (auth, curriculum, users)
├── app/
│   ├── (auth)/           Login
│   ├── (staff)/          Admin and Manager panels
│   ├── (student)/        Student onboarding and dashboard
│   └── api/              NextAuth, health check, webhooks
├── components/
│   ├── auth/
│   ├── staff/
│   └── shared/
├── generated/prisma/     Generated Prisma client
├── lib/                  Auth, DAL, Prisma, storage, email, rate limiting, data queries
├── schemas/              Zod schemas
├── types/                Type augmentation (NextAuth)
└── proxy.ts              Optimistic route gate
prisma/
├── schema.prisma
└── seed.ts
prisma.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project (PostgreSQL)
- Accounts for Google OAuth, Resend, Upstash Redis, and Cloudflare R2

### Installation

```bash
git clone <repository-url>
cd study-tracker
npm install
cp .env.example .env
```

Fill in `.env` using the table below, then:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

The app runs at http://localhost:3000.

### Creating the first Admin

Sign in once through the normal flow, then promote your own user:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

Alternatively, create the Admin from `prisma/seed.ts`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler connection string (runtime) |
| `DIRECT_URL` | Supabase session pooler connection string (migrations) |
| `NEXTAUTH_SECRET` | Secret used to sign JWTs |
| `NEXTAUTH_URL` | Canonical app URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender address for OTP emails |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key |
| `R2_BUCKET_NAME` | R2 bucket name |

---

## Database

The schema in `prisma/schema.prisma` is the source of truth for the data model. Key domains:

- **Auth:** `User`, `Account`, `Session`, `EmailOtp`
- **Curriculum:** `Track`, `Subject`, `Paper`, `Chapter`, `Topic`
- **Progress:** `TopicProgress`, `ChapterMastery`
- **Assessment:** `Quiz`, `QuizQuestion`, `QuizAttempt`
- **Content:** `ChapterPlaylist`, `PlaylistReview`, `ChapterSpecialVideo`, `StudentNote`, `OfficialNote`
- **Exams:** `ExternalExam`, `ExamResult`
- **Study tools:** `StudySession`, `StudyRoutine`, `StudyRoutineItem`, `TodoItem`
- **Gamification:** `PointTransaction`, `PointRule`, `LevelThreshold`, `LeaderboardSnapshot`
- **Commerce:** `Plan`, `Subscription`, `PaidBatch`, `Purchase`
- **Operations:** `Notification`, `AuditLog`

Prisma 7 reads its datasource from `prisma.config.ts`. Point the CLI datasource at the session pooler so migrations do not run through the transaction pooler.

```bash
npx prisma migrate dev --name <migration-name>
npx prisma migrate deploy
npx prisma generate
npx prisma validate
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check the project |
| `npx prisma validate` | Validate the Prisma schema |

---

## Authentication and Authorization

- **Sign-in:** Google OAuth or email one-time password.
- **OTP safety:** codes are hashed, expire after 10 minutes, are limited to five verification attempts, and are rate limited separately for request and verify.
- **Sessions:** JWT strategy, with `id` and `role` attached to the session.
- **Deactivation:** users with `isActive = false` cannot sign in.
- **Role gates:** `/admin` requires Admin, `/manager` requires Manager or Admin. Both are enforced in `proxy.ts` and again in server code through `requireRole()`.

---

## Design System

A warm dark theme implemented as CSS tokens in `globals.css` and exposed through the Tailwind theme. Components use tokens only, never raw color values.

| Token role | Use |
|---|---|
| Background, surface, elevated | Three elevation steps |
| Foreground, secondary text | Text hierarchy |
| Accent primary | Buttons, links, progress |
| Accent gamify | XP, level, streak |
| State success, warning, premium | Mastered, needs attention, locked |

Typography: Fraunces for display, Work Sans for body, IBM Plex Mono for scores, points, and timers.

---

## Roadmap

1. Foundation: auth, database, storage, email, rate limiting
2. RBAC, curriculum management, and staff role provisioning
3. Student onboarding and dashboard
4. Topic checklist and weighted progress
5. Per-chapter content model
6. Quiz and auto-validation engine
7. Points engine and leaderboards
8. External exam integration
9. Study tools: timer, routines, to-dos
10. Monetization: subscriptions and paid batches
11. Notifications, polish, and admin completeness
12. Hardening and launch

---

## Contributing

- Deliver in vertical slices: schema, server logic, UI, then manual QA.
- Validate every Server Action input with Zod and return `ActionState`.
- Call `requireRole()` in every staff action and `logAudit()` on every staff mutation.
- Use design tokens only.
- Write commits in [Conventional Commits](https://www.conventionalcommits.org/) format.
- Run lint, type-check, and `prisma validate` before opening a pull request.
