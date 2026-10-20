import { requireStudentChapter } from "@/lib/chapter-page";
import { hasChapterCoreAccess } from "@/lib/access";
import { ChapterSubpageHeader } from "@/components/student/chapter-subpage-header";
import { LockedSectionNotice } from "@/components/student/locked-section-notice";
import { TopicRow } from "@/components/student/topic-row";

export default async function ChapterChecklistPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const { profile, chapter, topicProgressByTopicId } = await requireStudentChapter(chapterId);
  const hasCoreAccess = await hasChapterCoreAccess(profile.id, chapter);

  return (
    <div className="max-w-3xl">
      <ChapterSubpageHeader section="checklist" chapter={chapter} />

      {!hasCoreAccess ? (
        <LockedSectionNotice label="The topic checklist" />
      ) : chapter.topics.length === 0 ? (
        <p className="text-text-secondary text-sm">No topics added yet.</p>
      ) : (
        <div className="space-y-5 pb-4">
          {chapter.topics.map((topic, index) => (
            <TopicRow
              key={topic.id}
              index={index}
              topicId={topic.id}
              name={topic.name}
              initial={
                topicProgressByTopicId.get(topic.id) ?? {
                  readDone: false,
                  lectureDone: false,
                  solvedDone: false,
                }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
