export type ChapterSectionKey =
  "lectures" | "checklist" | "notes" | "community" | "topics" | "tips";

export type ChapterSectionMeta = {
  title: string;
  emoji: string;
  /** Gem colour for the card glow, same language as the dashboard subject cards. */
  accent: string;
};

export const CHAPTER_SECTIONS: Record<ChapterSectionKey, ChapterSectionMeta> = {
  lectures: { title: "Lectures", emoji: "🎬", accent: "#5b8def" },
  checklist: { title: "Checklist", emoji: "✅", accent: "#34c08a" },
  notes: { title: "Notes", emoji: "📝", accent: "#9d7cff" },
  community: { title: "Community Notes", emoji: "👥", accent: "#4fb3d9" },
  topics: { title: "Topics", emoji: "🎯", accent: "#e0605b" },
  tips: { title: "Tips & Tricks", emoji: "💡", accent: "#e3a857" },
};
