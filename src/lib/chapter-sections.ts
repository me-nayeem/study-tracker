export type ChapterSectionKey =
  "lectures" | "checklist" | "notes" | "community" | "topics" | "tips";

export type ChapterSectionMeta = {
  title: string;
  emoji: string;
};

export const CHAPTER_SECTIONS: Record<ChapterSectionKey, ChapterSectionMeta> = {
  lectures: { title: "Lectures", emoji: "🎬" },
  checklist: { title: "Checklist", emoji: "✅" },
  notes: { title: "Notes", emoji: "📝" },
  community: { title: "Community Notes", emoji: "👥" },
  topics: { title: "Topics", emoji: "🎯" },
  tips: { title: "Tips & Tricks", emoji: "💡" },
};
