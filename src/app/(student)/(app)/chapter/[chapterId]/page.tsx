import { requireStudentChapter } from "@/lib/chapter-page";
import { hasChapterCoreAccess } from "@/lib/access";
import { getSubscribedFeatureKeys } from "@/lib/feature-subscriptions";
import { computeChapterProgress } from "@/lib/progress";
import { ChapterHero } from "@/components/student/chapter-hero";
import {
  ChapterSectionCards,
  type ChapterSectionCard,
} from "@/components/student/chapter-section-cards";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const { user, profile, chapter, topicProgressByTopicId, chapterMastery } =
    await requireStudentChapter(chapterId);

  const [hasCoreAccess, subscribedKeys] = await Promise.all([
    hasChapterCoreAccess(profile.id, chapter),
    getSubscribedFeatureKeys(user.id),
  ]);

  const percent = computeChapterProgress(chapter.topics, topicProgressByTopicId);
  const status = chapterMastery?.status ?? "NOT_STARTED";
  const topicsDone = chapter.topics.filter((topic) => {
    const flags = topicProgressByTopicId.get(topic.id);
    return flags?.readDone && flags.lectureDone && flags.solvedDone;
  }).length;

  const base = `/chapter/${chapter.id}`;
  const gated = hasCoreAccess ? "open" : "locked";

  const cards: ChapterSectionCard[] = [
    { key: "lectures", subtitle: "Video playlists", state: "open", href: `${base}/lectures` },
    {
      key: "checklist",
      subtitle: chapter.topics.length
        ? `${topicsDone}/${chapter.topics.length} topics`
        : "Track topics",
      state: gated,
      href: `${base}/checklist`,
    },
    { key: "notes", subtitle: "Official & yours", state: gated, href: `${base}/notes` },
    {
      key: "community",
      subtitle: "Shared by students",
      state: gated,
      href: `/notes?chapterId=${chapter.id}`,
    },
    {
      key: "topics",
      subtitle: "Topic-wise exams",
      state: "soon",
      featureKey: "chapter:topic-exams",
      subscribed: subscribedKeys.includes("chapter:topic-exams"),
    },
    {
      key: "tips",
      subtitle: "Shortcuts & hacks",
      state: "soon",
      featureKey: "chapter:tips",
      subscribed: subscribedKeys.includes("chapter:tips"),
    },
  ];

  return (
    <div className="space-y-6">
      <ChapterHero
        chapter={chapter}
        percent={percent}
        topicsDone={topicsDone}
        topicCount={chapter.topics.length}
        status={status}
        hasCoreAccess={hasCoreAccess}
      />
      <ChapterSectionCards cards={cards} />
    </div>
  );
}
