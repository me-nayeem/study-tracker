// ── Hero / marquee ──────────────────────────────────────────────

export const FEATURE_TICKER_ITEMS: string[] = [
  "Chapter-by-chapter progress tracking",
  "Auto-graded mastery quizzes",
  "Curated video playlists per chapter",
  "Real exams, broken down by topic",
  "Student notes — shared or private",
  "Weighted progress by chapter difficulty",
  "Study timer & session tracking",
  "Leaderboards for time and mastery",
  "Weekly routine builder",
  "To-do list built from your plan",
];

// ── How it works ─────────────────────────────────────────────────

export type HowItWorksStep = {
  title: string;
  description: string;
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Pick your track",
    description:
      "Tell us your level, group, and batch — we match you to the right curriculum instantly.",
  },
  {
    title: "Work the checklist",
    description:
      "Read, watch the lecture, solve problems — three checks per topic, tracked chapter by chapter.",
  },
  {
    title: "Auto-quiz on completion",
    description:
      "Mark a chapter done and a quiz fires immediately — no waiting, no manual grading.",
  },
  {
    title: "See exactly where you're weak",
    description: "Sit the real chapter exam and get a topic-by-topic breakdown, not just a score.",
  },
];

// ── Exam breakdown differentiator ────────────────────────────────

export type ExamBreakdownTopic = {
  name: string;
  percent: number;
};

export const SAMPLE_EXAM_BREAKDOWN: {
  chapterName: string;
  overallPercent: number;
  topics: ExamBreakdownTopic[];
} = {
  chapterName: "Chemical Bonding",
  overallPercent: 68,
  topics: [
    { name: "Ionic bonds", percent: 92 },
    { name: "Covalent bonds", percent: 78 },
    { name: "VSEPR theory", percent: 41 },
    { name: "Bond polarity", percent: 60 },
  ],
};

// ── Feature grid (per-chapter content types) ─────────────────────

export type FeatureGridItem = {
  title: string;
  description: string;
  tag: "Free" | "Pro";
};

export const FEATURE_GRID_ITEMS: FeatureGridItem[] = [
  {
    title: "Curated playlists",
    description:
      "Hand-picked YouTube playlists per chapter, plus your own rating and review — not YouTube's.",
    tag: "Free",
  },
  {
    title: "Tagged special videos",
    description:
      "Quick-hit one-shots, admission-prep clips, tricks, and motivation — tagged so you find them fast.",
    tag: "Free",
  },
  {
    title: "Student notes",
    description:
      "Upload your own notes per chapter, keep them private or share them — and earn points either way.",
    tag: "Free",
  },
  {
    title: "Personalized Pro notes",
    description:
      "Platform-authored notes per chapter — summary and detailed versions, written by our team.",
    tag: "Pro",
  },
];

// ── Gamification preview ─────────────────────────────────────────

export type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
};

export const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Tanvir A.", points: 4820 },
  { rank: 2, name: "Nusrat J.", points: 4510 },
  { rank: 3, name: "Rafiul I.", points: 4290 },
  { rank: 4, name: "You", points: 3960 },
  { rank: 5, name: "Mehnaz K.", points: 3810 },
];

// ── Free vs Pro comparison ───────────────────────────────────────

export type PlanComparisonRow = {
  feature: string;
  free: boolean;
  pro: boolean;
};

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  { feature: "Signup, onboarding, curriculum tree", free: true, pro: true },
  { feature: "Topic checklist & progress tracking", free: true, pro: true },
  { feature: "Curated YouTube playlists + reviews", free: true, pro: true },
  { feature: "Tagged special videos", free: true, pro: true },
  { feature: "Upload your own notes per chapter", free: true, pro: true },
  { feature: "View other students' public notes", free: true, pro: true },
  { feature: "Auto-quiz on chapter completion", free: true, pro: true },
  { feature: "Chapter-wise external exam + breakdown", free: true, pro: true },
  { feature: "Topic-wise external exam + breakdown", free: false, pro: true },
  { feature: "Personalized (official) notes per chapter", free: false, pro: true },
  { feature: "To-do list, routine builder, study timer", free: true, pro: true },
  { feature: "Both leaderboards", free: true, pro: true },
  { feature: "Full recorded lecture batches", free: false, pro: true },
  { feature: "Deep analytics (long-term trends)", free: false, pro: true },
  { feature: "Downloadable / offline notes", free: false, pro: true },
];
