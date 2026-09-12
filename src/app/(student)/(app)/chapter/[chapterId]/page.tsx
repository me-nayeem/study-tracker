import Link from "next/link";
import { Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getChapterDetail } from "@/lib/student-data";
import {
  getPlaylistsForChapterStudentView,
  getSpecialVideosForChapterStudentView,
  getOfficialNotesForChapterStudentView,
  getStudentNotesForChapterOwner,
} from "@/lib/content-data";
import { hasProAccess, hasChapterCoreAccess } from "@/lib/access";
import { computeChapterProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/student/progress-bar";
import { MasteryBadge } from "@/components/student/mastery-badge";
import { TopicRow } from "@/components/student/topic-row";
import { MarkCompleteButton } from "@/components/student/mark-complete-button";
import { PlaylistSection } from "@/components/student/playlist-section";
import { SpecialVideoSection } from "@/components/student/special-video-section";
import { OfficialNoteSection } from "@/components/student/official-note-section";
import { StudentNoteSection } from "@/components/student/student-note-section";
import { ChapterTabs } from "@/components/student/chapter-tabs";
import { TipsSection } from "@/components/student/tips-section";
import { getChapterTipsForChapterStudentView } from "@/lib/content-data";
import { TopicExamSection } from "@/components/student/topic-exam-section";
import { FileText, Users, NotebookPen } from "lucide-react";

function LockedSectionNotice({ label }: { label: string }) {
  return (
    <div className="border-state-premium/30 bg-state-premium/10 rounded-xl border p-6 text-center">
      <Lock className="text-state-premium mx-auto h-6 w-6" />
      <p className="text-foreground mt-2 text-sm font-medium">
        {label} is part of this chapter is Pro content
      </p>
      <p className="text-text-secondary mt-1 text-xs">
        This chapter is not in your free preview. Ask about Pro access to unlock it.
      </p>
    </div>
  );
}

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  const chapterTips = await getChapterTipsForChapterStudentView(chapterId);

  if (!profile) {
    notFound();
  }

  const detail = await getChapterDetail(chapterId, profile.id, profile.trackId);

  if (!detail) {
    notFound();
  }

  const { chapter, topicProgressByTopicId, chapterMastery } = detail;

  const specialVideos = await getSpecialVideosForChapterStudentView(chapterId);
  const officialNotes = await getOfficialNotesForChapterStudentView(chapterId);
  const isProUnlocked = await hasProAccess(profile.id);
  const hasCoreAccess = await hasChapterCoreAccess(profile.id, chapter);
  const playlists = await getPlaylistsForChapterStudentView(chapterId, profile.id);

  const ownNotes = await getStudentNotesForChapterOwner(chapterId, profile.id);

  const percent = computeChapterProgress(chapter.topics, topicProgressByTopicId);
  const status = chapterMastery?.status ?? "NOT_STARTED";
  const canMarkComplete = status === "NOT_STARTED" || status === "IN_PROGRESS";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/paper/${chapter.paperId}`}
          className="text-text-secondary hover:text-foreground text-sm"
        >
          ← Back
        </Link>
        <p className="text-text-secondary mt-2 text-xs">
          {chapter.paper.subject.name} · {chapter.paper.name}
        </p>

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-foreground text-2xl">{chapter.name}</h1>
              <MasteryBadge status={status} />
              {!hasCoreAccess && (
                <span className="bg-state-premium/15 text-state-premium flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  <Lock className="h-3 w-3" />
                  Pro
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 sm:max-w-md">
              <div className="flex-1">
                <ProgressBar percent={percent} />
              </div>
              <span className="text-text-secondary font-mono text-xs">{percent}%</span>
            </div>
          </div>

          <div className="shrink-0">
            {!hasCoreAccess ? null : canMarkComplete ? (
              <MarkCompleteButton chapterId={chapter.id} />
            ) : status === "AWAITING_QUIZ" || status === "NEEDS_REVIEW" ? (
              <Link
                href={`/chapter/${chapter.id}/quiz`}
                className="bg-accent-primary text-background inline-block rounded-lg px-6 py-2.5 text-center text-sm font-medium transition-transform active:scale-[0.98]"
              >
                {status === "NEEDS_REVIEW" ? "Retake quiz" : "Take quiz"}
              </Link>
            ) : (
              <p className="text-state-success text-sm font-medium">Chapter mastered</p>
            )}
          </div>
        </div>
      </div>

      <ChapterTabs
        lectures={<PlaylistSection playlists={playlists} />}
        exam={
          hasCoreAccess ? (
            <TopicExamSection topics={chapter.topics} />
          ) : (
            <LockedSectionNotice label="Topic exams" />
          )
        }
        checklist={
          !hasCoreAccess ? (
            <LockedSectionNotice label="The topic checklist" />
          ) : chapter.topics.length === 0 ? (
            <p className="text-text-secondary text-sm">No topics added yet.</p>
          ) : (
            <div className="space-y-2">
              {chapter.topics.map((topic) => (
                <TopicRow
                  key={topic.id}
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
          )
        }
        notes={
          !hasCoreAccess ? (
            <LockedSectionNotice label="Notes" />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="bg-accent-purple/10 border-accent-purple/25 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <span className="bg-accent-purple/15 text-accent-purple flex h-8 w-8 items-center justify-center rounded-lg">
                    <FileText className="h-4 w-4" />
                  </span>
                  <h3 className="text-foreground text-sm font-semibold">Official Notes</h3>
                </div>
                <div className="mt-3">
                  <OfficialNoteSection notes={officialNotes} isProUnlocked={isProUnlocked} />
                </div>
              </div>

              <div className="bg-accent-teal/10 border-accent-teal/25 flex flex-col rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <span className="bg-accent-teal/15 text-accent-teal flex h-8 w-8 items-center justify-center rounded-lg">
                    <Users className="h-4 w-4" />
                  </span>
                  <h3 className="text-foreground text-sm font-semibold">Community Notes</h3>
                </div>
                <p className="text-text-secondary mt-2 flex-1 text-sm">
                  Browse notes shared by other students, ranked by likes and ratings.
                </p>
                <Link
                  href={`/notes?chapterId=${chapter.id}`}
                  className="bg-accent-teal text-background mt-3 inline-block rounded-lg px-4 py-2 text-center text-sm font-medium transition-opacity hover:opacity-90"
                >
                  View community notes
                </Link>
              </div>

              <div className="bg-accent-gamify/10 border-accent-gamify/25 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <span className="bg-accent-gamify/15 text-accent-gamify flex h-8 w-8 items-center justify-center rounded-lg">
                    <NotebookPen className="h-4 w-4" />
                  </span>
                  <h3 className="text-foreground text-sm font-semibold">My Notes</h3>
                </div>
                <div className="mt-3">
                  <StudentNoteSection chapterId={chapter.id} ownNotes={ownNotes} />
                </div>
              </div>
            </div>
          )
        }
        special={<SpecialVideoSection videos={specialVideos} />}
        tips={hasCoreAccess ? <TipsSection tips={chapterTips} /> : <LockedSectionNotice label="Tips & tricks" />}
      />
    </div>
  );
}