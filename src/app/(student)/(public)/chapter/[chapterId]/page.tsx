import { getChapterForViewer } from "@/lib/chapter-page";
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
  const { viewer, chapter, topicProgressByTopicId, chapterMastery } =
    await getChapterForViewer(chapterId);
  const guest = viewer.kind === "guest";

  // visitors: every section opens through login, so there is nothing to lock or subscribe yet
  const [hasCoreAccess, subscribedKeys] = guest
    ? [true, [] as string[]]
    : await Promise.all([
        hasChapterCoreAccess(viewer.profile.id, chapter),
        getSubscribedFeatureKeys(viewer.user.id),
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
      subtitle:
        chapter.topics.length === 0
          ? "Track topics"
          : guest
            ? `${chapter.topics.length} topics`
            : `${topicsDone}/${chapter.topics.length} topics`,
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
      subtitle: chapter.topics.length ? `${chapter.topics.length} topics` : "Exams & videos",
      state: "open",
      href: `${base}/topics`,
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
        guest={guest}
      />
      <ChapterSectionCards cards={cards} guest={guest} />
    </div>
  );
}
