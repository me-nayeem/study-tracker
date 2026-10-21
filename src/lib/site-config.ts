export const SITE_NAME = "Oggrogoti";
export const SITE_DESCRIPTION =
  "Chapter-wise progress tracking, quizzes, and leaderboards for HSC students.";
export const SITE_URL = "https://study-tracker-brown-pi.vercel.app";
export const SUPPORT_EMAIL = "menayeemahmed100@gmail.com";
export const LEGAL_LAST_UPDATED = "September 7, 2026";

/** The company behind the product, shown on the contact page. */
export const COMPANY = {
  name: "AnoFamous",
  logo: { src: "/brand/anofamous.webp", width: 900, height: 216 },
  facebookUrl: "https://www.facebook.com/profile.php?id=61595556236590",
  linkedinUrl: "https://www.linkedin.com/company/anofamous",
  email: "team.anofamous@gmail.com",
  whatsapp: "+8801879333905",
} as const;

/** Our admission MCQ game, promoted on the dashboard. Set `url` once the app is live. */
export const PORISSHROMI = {
  name: "Porisshromi",
  tagline: "Admission MCQ, game style",
  url: null as string | null,
  // emblem on a black background; shown with mix-blend-lighten so the black disappears
  logo: { src: "/brand/porisshromi.webp", width: 557, height: 653 },
} as const;
