/** Every coming-soon feature a student can join the waitlist for ("Notify me"). */
export const COMING_SOON_FEATURES = {
  "subject:bangla": "Bangla",
  "subject:english": "English",
  "subject:ict": "ICT",
  "chapter:topic-exams": "Topic-wise exams",
  "chapter:tips": "Tips & tricks",
  "topic:videos": "Topic videos",
  "leaderboard:study-time": "Study-time leaderboard",
  routine: "Study routine",
} as const;

export type FeatureKey = keyof typeof COMING_SOON_FEATURES;

export function isFeatureKey(value: string): value is FeatureKey {
  return Object.prototype.hasOwnProperty.call(COMING_SOON_FEATURES, value);
}

/**
 * HSC subjects not on the platform yet. Shown on the dashboard as "coming soon" cards
 * until the track gets a real subject whose name matches.
 */
export const HSC_UPCOMING_SUBJECTS: {
  featureKey: FeatureKey;
  name: string;
  papers: number;
  match: RegExp;
}[] = [
  { featureKey: "subject:bangla", name: "Bangla", papers: 2, match: /bangla|bengali|বাংলা/i },
  { featureKey: "subject:english", name: "English", papers: 2, match: /english|ইংরেজি/i },
  {
    featureKey: "subject:ict",
    name: "ICT",
    papers: 1,
    match: /\bict\b|information|তথ্য/i,
  },
];
