import type { StudentDashboardData } from "@/lib/student-data";
import { computeSubjectProgress } from "@/lib/progress";
import { HSC_UPCOMING_SUBJECTS } from "@/lib/coming-soon";
import {
  SubjectCardDeck,
  type SubjectCardData,
  type UpcomingSubjectCardData,
} from "./subject-card-deck";

export function SubjectList({
  data,
  subscribedKeys,
  guest = false,
}: {
  data: StudentDashboardData;
  subscribedKeys: string[];
  /** visitor who isn't signed in: cards without progress */
  guest?: boolean;
}) {
  const { track, topicProgressByTopicId, chapterMasteryByChapterId } = data;

  const subjects: SubjectCardData[] = (track?.subjects ?? []).map((subject) => {
    const allChapters = subject.papers.flatMap((paper) => paper.chapters);
    return {
      id: subject.id,
      name: subject.name,
      percent: computeSubjectProgress(allChapters, topicProgressByTopicId),
      chapterCount: allChapters.length,
      masteredCount: allChapters.filter(
        (chapter) => chapterMasteryByChapterId.get(chapter.id)?.status === "MASTERED"
      ).length,
      papers: subject.papers.map((paper) => ({
        id: paper.id,
        name: paper.name,
        percent: computeSubjectProgress(paper.chapters, topicProgressByTopicId),
        chapterCount: paper.chapters.length,
      })),
    };
  });

  // HSC subjects that aren't on the platform yet; each disappears once the track gets the real one.
  const upcoming: UpcomingSubjectCardData[] =
    track?.level === "HSC"
      ? HSC_UPCOMING_SUBJECTS.filter(
          (upcomingSubject) => !subjects.some((s) => upcomingSubject.match.test(s.name))
        ).map((upcomingSubject) => ({
          featureKey: upcomingSubject.featureKey,
          name: upcomingSubject.name,
          papers: upcomingSubject.papers,
          subscribed: subscribedKeys.includes(upcomingSubject.featureKey),
        }))
      : [];

  if (subjects.length === 0 && upcoming.length === 0) {
    return (
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">
          No subjects have been added to your track yet. Check back soon.
        </p>
      </div>
    );
  }

  return <SubjectCardDeck subjects={subjects} upcoming={upcoming} guest={guest} />;
}
