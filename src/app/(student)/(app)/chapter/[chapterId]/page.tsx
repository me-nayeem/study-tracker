import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getChapterDetail } from "@/lib/student-data";
import {
  getPlaylistsForChapterStudentView,
  getSpecialVideosForChapterStudentView,
  getOfficialNotesForChapterStudentView,
} from "@/lib/content-data";
import { hasProAccess } from "@/lib/access";
import { computeChapterProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/student/progress-bar";
import { MasteryBadge } from "@/components/student/mastery-badge";
import { TopicRow } from "@/components/student/topic-row";
import { MarkCompleteButton } from "@/components/student/mark-complete-button";
import { PlaylistSection } from "@/components/student/playlist-section";
import { SpecialVideoSection } from "@/components/student/special-video-section";
import { OfficialNoteSection } from "@/components/student/official-note-section";

import {
  getStudentNotesForChapterOwner,
  getPublicStudentNotesForChapter,
} from "@/lib/content-data";
import { StudentNoteSection } from "@/components/student/student-note-section";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    notFound();
  }

  const detail = await getChapterDetail(chapterId, profile.id, profile.trackId);

  if (!detail) {
    notFound();
  }

  const { chapter, topicProgressByTopicId, chapterMastery } = detail;
  const { playlists, reviewByPlaylistId } = await getPlaylistsForChapterStudentView(
    chapterId,
    profile.id
  );
  const specialVideos = await getSpecialVideosForChapterStudentView(chapterId);
  const officialNotes = await getOfficialNotesForChapterStudentView(chapterId);
  const isProUnlocked = await hasProAccess(profile.id);

  const ownNotes = await getStudentNotesForChapterOwner(chapterId, profile.id);
  const publicNotes = await getPublicStudentNotesForChapter(chapterId, profile.id);

  const percent = computeChapterProgress(chapter.topics, topicProgressByTopicId);
  const status = chapterMastery?.status ?? "NOT_STARTED";
  const canMarkComplete = status === "NOT_STARTED" || status === "IN_PROGRESS";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-text-secondary text-xs hover:underline">
          ← Dashboard
        </Link>
        <p className="text-text-secondary mt-2 text-xs">
          {chapter.paper.subject.name} · {chapter.paper.name}
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="font-display text-foreground text-2xl">{chapter.name}</h1>
          <MasteryBadge status={status} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar percent={percent} />
          </div>
          <span className="text-text-secondary font-mono text-xs">{percent}%</span>
        </div>
      </div>

      <div>
        <h2 className="font-display text-foreground text-lg">Playlists</h2>
        <div className="mt-3">
          <PlaylistSection playlists={playlists} reviewByPlaylistId={reviewByPlaylistId} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-foreground text-lg">Special videos</h2>
        <div className="mt-3">
          <SpecialVideoSection videos={specialVideos} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-foreground text-lg">Official notes</h2>
        <div className="mt-3">
          <OfficialNoteSection notes={officialNotes} isProUnlocked={isProUnlocked} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-foreground text-lg">Student notes</h2>
        <div className="mt-3">
          <StudentNoteSection
            chapterId={chapter.id}
            ownNotes={ownNotes}
            publicNotes={publicNotes}
          />
        </div>
      </div>

      <div>
        <h2 className="font-display text-foreground text-lg">Checklist</h2>
        <div className="mt-3">
          {chapter.topics.length === 0 ? (
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
          )}
        </div>
      </div>

      <div className="border-bg-elevated border-t pt-4">
        {canMarkComplete ? (
          <MarkCompleteButton chapterId={chapter.id} />
        ) : (
          <p className="text-text-secondary text-sm">
            This chapter has already been submitted for review.
          </p>
        )}
      </div>
    </div>
  );
}
