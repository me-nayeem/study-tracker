# Feature: Authentication & Access Foundation

## Overview

Sign-in for the platform via two methods — email OTP and Google OAuth —
plus the authorization pattern every protected route and Server Action
builds on. This is foundational: no other feature can be built until a
user can be identified and their role checked.

## What's included

- Email OTP sign-in (6-digit code, 10-minute expiry, rate-limited)
- Google OAuth sign-in
- Two-layer role-based access control (optimistic + authoritative)
- Login UI (two-step form, Google button, responsive)
- Warm dark design system (color tokens, font stack)
- Favicon

## Architecture

### Authorization has two layers, by design

**`proxy.ts`** — runs before a request reaches any page. Decodes the
session JWT from the cookie (`getToken()`), no database call. Redirects
unauthenticated requests to `/login`, and redirects role-mismatched
requests away from `/admin` or `/manager`. This exists purely to avoid
rendering a page the user shouldn't see, and to keep that check fast
(it runs on every navigation, including prefetches).

**`lib/dal.ts`** — the actual security boundary. `getCurrentUser()`,
`requireUser()`, and `requireRole()` re-verify the session against the
database-backed `getServerSession()` call. Every Server Action and
Server Component that mutates or reads sensitive data calls into this
layer directly — `proxy.ts` is never trusted alone for anything that
writes data.

### OTP flow

1. `requestOtp` Server Action (`actions/auth.ts`) — validates the email
   with Zod, checks the Upstash rate limiter (3 requests / 10 min per
   email), expires any still-valid unconsumed code for that email, then
   creates a new `EmailOtp` row (hashed code, 10-minute expiry) and
   sends it via Resend.
2. User submits the code → client calls `signIn("credentials", { email,
code })` → NextAuth invokes `authorize()` in `lib/auth.ts`.
3. `authorize()` re-validates with Zod, checks a separate rate limiter
   (10 verify attempts / 10 min per email — a different attack shape
   than the request limiter), looks up the latest `EmailOtp` row,
   rejects on expiry/already-consumed/attempts-exceeded, compares the
   hash, and on success marks the code consumed and upserts the `User`.
4. NextAuth's `jwt` callback embeds `id`/`role` into the token; the
   `session` callback exposes them on `session.user`.

### Google flow

Handled by NextAuth's built-in Google provider + `PrismaAdapter`. No
custom logic — Google has already verified the email before handing
control back, so no OTP step applies to this path.

## Key files

| File                                        | Responsibility                                             |
| ------------------------------------------- | ---------------------------------------------------------- |
| `schemas/auth.ts`                           | Zod schemas for OTP request/verify                         |
| `actions/auth.ts`                           | `requestOtp` Server Action                                 |
| `lib/auth.ts`                               | NextAuth config — providers, callbacks, `authorize()`      |
| `lib/rate-limit.ts`                         | Upstash limiters (`otpRequestLimiter`, `otpVerifyLimiter`) |
| `lib/email.ts`                              | Resend wrapper                                             |
| `lib/prisma.ts`                             | Prisma client singleton                                    |
| `lib/storage.ts`                            | R2 presigned upload/download URLs                          |
| `lib/dal.ts`                                | Authoritative session/role checks                          |
| `proxy.ts`                                  | Optimistic route protection                                |
| `types/next-auth.d.ts`                      | Module augmentation for `id`/`role`                        |
| `app/api/auth/[...nextauth]/route.ts`       | NextAuth route handler                                     |
| `components/auth/login-form.tsx`            | Login UI logic                                             |
| `components/auth/mastery-constellation.tsx` | Signature visual                                           |
| `app/(auth)/login/page.tsx`                 | Login page layout                                          |

## Environment variables required

```
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

## Known gaps / not yet built

- **No staff role provisioning yet.** Every sign-in creates or matches
  a `User` with `role: STUDENT`. Promoting a user to MANAGER or ADMIN
  is a separate, not-yet-built Admin action — see the curriculum
  management feature.
- **`/dashboard` route doesn't exist yet.** Successful login currently
  redirects to a route that 404s. Not a bug in this feature — the
  dashboard is a separate, later feature.
- **No visual resend-cooldown on the login form.** The server-side
  rate limit is enforced regardless, but the UI doesn't show a
  countdown — purely a polish gap.
- **Google sign-ins don't explicitly set `emailVerified`.** Functionally
  fine (Google has already verified the email), but the DB column
  won't reflect it unless a `profile()` callback is added later.
