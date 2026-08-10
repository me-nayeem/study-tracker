# Feature: Admin

## Overview

The Admin feature gives users with the `ADMIN` role full operational control over the platform: defining the curriculum structure, managing staff access, and auditing every privileged action taken across the system. It is the foundation all other staff-facing tooling (content moderation, exam reconciliation, pricing) is built on top of.

## Scope

- Curriculum management (Track → Subject → Paper → Chapter → Topic)
- Staff & role provisioning (promote/demote users, activate/deactivate accounts)
- Audit logging and log review

Out of scope for this document: content modules (playlists, videos, notes), quiz engine, exam reconciliation, pricing — these reuse the same RBAC and audit patterns but are separate features.

## Access Control

- Role: `ADMIN` only. `MANAGER` and `STUDENT` have no access to any route or action described here.
- Enforcement is two-layered:
  1. `proxy.ts` — optimistic, cookie-only redirect for `/admin/*` routes (first filter, not authoritative).
  2. `requireRole(["ADMIN"])` from `lib/dal.ts` — called explicitly as the first line of every page and every Server Action in this feature. This is the authoritative check; the proxy filter is a UX convenience only.
- Every mutation additionally writes an `AuditLog` entry inside the same database transaction as the change itself, so a write and its audit record can never diverge.

## 1. Curriculum Management

**Route:** `/admin/curriculum`

Manages the five-level curriculum tree that all student-facing content and progress tracking is built on:

`Track → Subject → Paper → Chapter → Topic`

| Level   | Key fields                                          | Notes                                                                                                                                                                                            |
| ------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Track   | `name`, `level`, `group`, `batchYear`, `examDate`   | Unique per `(level, group, batchYear)`                                                                                                                                                           |
| Subject | `name`, `order`                                     | Unique per Track                                                                                                                                                                                 |
| Paper   | `name`, `order`                                     | Unique per Subject                                                                                                                                                                               |
| Chapter | `name`, `order`, `examWeight`, `masteryPassPercent` | Unique per Paper. `examWeight` drives both subject-progress-bar weighting and points scoring (shared field, by design). `masteryPassPercent` is the quiz threshold for MASTERED vs NEEDS_REVIEW. |
| Topic   | `name`, `order`                                     | Unique per Chapter                                                                                                                                                                               |

**UI:** single-page nested accordion (Track → Subject → Paper → Chapter → Topic), inline add/edit forms at every level, expand-in-place — no drill-down navigation.

**Delete behavior:**

- Track, Subject, Paper, Chapter: soft delete via `isArchived` toggle (archive/restore). No hard delete.
- Topic: hard delete, application-guarded. A Topic cannot be deleted if it has any `Resource` or `ExternalExam` records attached (must be removed first). Student `TopicProgress` records are additionally protected at the database level (`onDelete: Restrict`), so a Topic with student history cannot be deleted under any circumstance.

**Validation:** Zod schemas in `schemas/curriculum.ts`. Enum values (`EducationLevel`, `GroupType`) sourced from generated Prisma enums, not hand-duplicated.

## 2. Staff & Role Provisioning

**Route:** `/admin/staff-roles`

There is no separate signup path for staff. Every account — student, manager, admin — is created identically through Google/OTP login with `role: STUDENT`. Manager and Admin access is granted by promoting an existing user; the very first Admin account must be set directly in the database (documented separately in the project README, not exposed as UI, since no admin exists yet to perform the promotion).

**Capabilities:**

- Search users by name or email (debounced, URL-persisted query)
- Change a user's role (`STUDENT` / `MANAGER` / `ADMIN`)
- Toggle a user's `isActive` status (deactivated users cannot sign in — enforced in the auth `authorize()` callback)

**Safeguards (enforced server-side, not just UI-disabled):**

- An Admin cannot change their own role or deactivate their own account through this panel.
- The last remaining `ADMIN` cannot be demoted by anyone. The system always requires at least one active Admin.

**UI note:** role selection uses a native `<select>`. On narrow viewports the list view switches to stacked cards (rather than a horizontally-scrolling table) specifically to avoid native dropdown-popup positioning issues inside scroll containers.

## 3. Audit Log

**Route:** `/admin/audit-log`

Read-only view over every `AuditLog` row written by the actions above (and by any future staff feature that adopts the same `logAudit()` helper).

**Filters:** entity type, action — both URL-persisted, combinable (AND, not OR).

**Recorded per entry:** timestamp, actor, action, entity type + ID, and a `metadata` JSON blob (e.g. `{ before, after }` for updates, `{ from, to }` for role changes) — expandable inline, not always visible, to keep the log scannable.

**Audit vocabulary** (`lib/audit.ts`):

- Actions: `CREATE`, `UPDATE`, `DELETE`, `ARCHIVE`, `APPROVE`, `REJECT`, `ROLE_CHANGED`, `ACTIVATED`, `DEACTIVATED`, `RECONCILED`, `DISPUTE_RESOLVED`
- Entities: `User`, `Track`, `Subject`, `Paper`, `Chapter`, `Topic`, `ChapterPlaylist`, `ChapterSpecialVideo`, `StudentNote`, `OfficialNote`, `ExamResult`, `PointRule`, `Plan`, `PaidBatch`
- Archive and restore share the single `ARCHIVE` action, distinguished via `metadata.isArchived` — there is intentionally no separate `RESTORE` action.

**Current scope:** Admin-only. Managers have no audit log view in this build; a Manager-scoped ("my actions only") view is a defined but not-yet-built extension.

## Architecture Reference

| Concern                 | Location                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Authorization           | `lib/dal.ts` (`requireRole`, `requireUser`, `getCurrentUser`)                         |
| Route-level gate        | `proxy.ts`                                                                            |
| Audit logging           | `lib/audit.ts` (`logAudit`)                                                           |
| Error normalization     | `lib/prisma-errors.ts` (`handlePrismaError`, `fieldErrorState`, `ActionState`)        |
| Curriculum data/queries | `lib/curriculum-data.ts`                                                              |
| Curriculum mutations    | `actions/curriculum.ts`                                                               |
| Curriculum validation   | `schemas/curriculum.ts`                                                               |
| Staff/user data/queries | `lib/user-data.ts`                                                                    |
| Staff/user mutations    | `actions/users.ts`                                                                    |
| Staff/user validation   | `schemas/user-management.ts`                                                          |
| Audit log queries       | `lib/audit-data.ts`                                                                   |
| Shared form utilities   | `lib/form-data.ts`                                                                    |
| UI (curriculum)         | `components/staff/curriculum/*`                                                       |
| UI (staff/roles)        | `components/staff/users/*`                                                            |
| UI (audit log)          | `components/staff/audit/*`                                                            |
| Shared staff UI         | `components/staff/shared/*`, `components/staff/curriculum/classes.ts` (design tokens) |

**Pattern:** every mutation follows the same shape — `requireRole()` → Zod `safeParse` → `prisma.$transaction` containing the write plus a `logAudit()` call → `handlePrismaError()` on failure (typed P2002/P2003/P2025 handling, no raw DB errors surfaced to the UI) → `revalidatePath()` on success. Forms use `useActionState` + Server Actions, consistent with the existing OTP-auth pattern (`schemas/auth.ts`, `actions/auth.ts`).

## Known Limitations

- Native `<select>` for role changes has non-themed browser-default popup styling; functional, not visually matched to the design system. A custom listbox component is a documented, not-yet-scheduled follow-up.
- Errors on archive/delete actions currently surface via `alert()` / `confirm()` — there is no toast/notification system in the codebase yet.
- Manager-scoped audit log view is not built (see Audit Log section above).

## Testing Notes

No automated test coverage yet (Playwright E2E is scheduled for the hardening phase per the project's build plan). This feature has been manually QA'd for: full curriculum tree CRUD, unique-constraint collision messaging, archive/restore correctness, guarded Topic deletion, role promotion/demotion including last-admin and self-action guards, account activation/deactivation, and audit log filtering/pagination — with every action verified against its corresponding `AuditLog` row.
