import { Bell } from "lucide-react";
import { requireStudentChapter } from "@/lib/chapter-page";
import { getSubscribedFeatureKeys } from "@/lib/feature-subscriptions";
import { ChapterSubpageHeader } from "@/components/student/chapter-subpage-header";
import { NotifyMeButton } from "@/components/shared/notify-me-button";
import { TopicToolsRow } from "@/components/student/topic-tools-row";

export default async function ChapterTopicsPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const { user, chapter } = await requireStudentChapter(chapterId);
  const subscribed = (await getSubscribedFeatureKeys(user.id)).includes("chapter:topic-exams");

  return (
    <div className="max-w-3xl">
      <ChapterSubpageHeader section="topics" chapter={chapter} />

      {/* waitlist for topic exams & videos; once joined, the button is replaced for good */}
      <section className="card-surface mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="bg-gold/10 text-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Bell className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-semibold sm:text-base">
              Topic exams &amp; videos are coming soon
            </p>
            <p className="text-text-secondary text-xs sm:text-sm">
              Get notified as soon as they&apos;re ready.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <NotifyMeButton featureKey="chapter:topic-exams" initialSubscribed={subscribed} />
        </div>
      </section>

      {chapter.topics.length === 0 ? (
        <p className="text-text-secondary text-sm">No topics added yet.</p>
      ) : (
        <div className="space-y-5 pb-4">
          {chapter.topics.map((topic, index) => (
            <TopicToolsRow key={topic.id} index={index} name={topic.name} />
          ))}
        </div>
      )}
    </div>
  );
}
