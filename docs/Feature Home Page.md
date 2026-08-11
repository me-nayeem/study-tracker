# Public Home Page

Status: **Complete** — QA passed on mobile (375px), tablet (768px), and desktop (1024px+).

## Overview

The unauthenticated landing page at `/`, replacing the placeholder `Home` component.
Redirects signed-in users to their role's dashboard (`/admin`, `/manager`, or
`/dashboard`) same as before; unauthenticated visitors see the full marketing page.

## Section order

1. `SiteHeader` — sticky solid header (logo, nav links, "Get started" CTA, mobile hamburger)
2. `HeroCarousel` — full-bleed cross-fading image carousel with headline/CTA overlay
3. `FeatureMarquee` — infinite-scroll ticker of feature highlights
4. `HowItWorks` — 4-step numbered sequence (`#how-it-works` anchor)
5. `ExamBreakdownSection` — the product differentiator: chapter exam → topic-level breakdown, with a sample result card
6. `FeatureGrid` — the four per-chapter content types from product plan §3 (`#features` anchor)
7. `GamificationPreview` — points/leaderboard pitch with a sample leaderboard card
8. `PlanComparison` — Free vs Pro feature table, pulled from product plan §6 (`#pricing` anchor)
9. `FinalCta` — single closing CTA
10. `SiteFooter` — nav links, sign-in link, developer credits

## New files

```
src/app/page.tsx                                  — rebuilt: assembles all sections
src/app/developer/page.tsx                         — developer credits page
src/lib/hero-slides.ts                             — hero image + alt text config
src/lib/marketing-content.ts                       — all static marketing copy/data
src/lib/developers.ts                              — developer contact info
src/components/marketing/site-header.tsx
src/components/marketing/hero-carousel.tsx
src/components/marketing/feature-marquee.tsx
src/components/marketing/how-it-works.tsx
src/components/marketing/exam-breakdown-section.tsx
src/components/marketing/feature-grid.tsx
src/components/marketing/gamification-preview.tsx
src/components/marketing/plan-comparison.tsx
src/components/marketing/final-cta.tsx
src/components/marketing/site-footer.tsx
```

## Modified files

```
src/proxy.ts        — added /developer to PUBLIC_ROUTES; matcher now excludes any
                       path with a file extension (fixes static assets under
                       /public being caught by the auth redirect)
src/app/globals.css — .hero-slide opacity-transition rule (replaces the earlier
                       transform-based .hero-active-slide); .marquee-track
                       keyframes/animation
```

## Key decisions

- **Header:** solid bar above the hero (not a transparent overlay) — hero height
  is `calc(100svh - header height)` so header + hero fill exactly one viewport.
- **Hero carousel:** all slides stay mounted; cross-fade via `opacity` only (no
  transform/translate, no grayscale dimming, no key-based remount). A constant
  `bg-background/55` overlay sits above all slides so text stays legible
  regardless of the source image's brightness — replaced an earlier per-slide
  gradient approach that wasn't reliable across varied image content.
- **Hero images:** 3 slides, generated (not stock — stock search couldn't match
  the brief on ethnicity/composition/licensing). Target ratio ~16:9
  (1920×1080 or similar); square/near-square generations require a regenerate,
  not a CSS workaround, to avoid inconsistent crop styles across slides.
- **No fake social proof.** Sample leaderboard and sample exam-breakdown cards
  are both explicitly labeled "Sample" — no fabricated testimonials or user counts.
- **Pro table has no pricing numbers** — feature-gating only (product plan has no
  confirmed price points yet; Plan model has no seed data).
- **Developer credit lives in the footer**, not primary nav — kept out of the
  way of signup/CTA attention per standard practice for a student-facing product.
- **Mobile hero text** is centered (both axes) via `items-center justify-center
  text-center`; desktop keeps the original bottom-left-anchored layout via
  `md:items-start md:justify-end md:text-left`.

## Known follow-ups (not blocking)

- Header nav currently has 3 links; if a 4th is added later, re-check it doesn't
  overflow before the `md:` breakpoint hides it behind the hamburger.
- Dev 2's portfolio URL is a placeholder omission in `src/lib/developers.ts` —
  update when available.
- `lib/prisma-errors.ts` has a redundant (unreachable) second error-class check
  in `handlePrismaError` — cosmetic, unrelated to this feature, flagged for a
  future cleanup pass.