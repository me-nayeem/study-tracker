import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getPaperDetail } from "@/lib/student-data";
import { computeSubjectProgress, computeChapterProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/student/progress-bar";
import { ChapterCard } from "@/components/student/chapter-card";

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const data = await getPaperDetail(paperId, profile.id, profile.trackId);
  if (!data) {
    notFound();
  }

  const { paper, topicProgressByTopicId, chapterMasteryByChapterId } = data;
  const paperPercent = computeSubjectProgress(paper.chapters, topicProgressByTopicId);

  return (
    <div>
      {/* <Link href="/dashboard" className="text-text-secondary hover:text-foreground text-sm">
        ← Back to dashboard
      </Link> */}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-text-secondary text-sm">{paper.subject.name}</p>
          <h1 className="font-display text-foreground text-2xl">{paper.name}</h1>
        </div>
        <span className="text-text-secondary font-mono text-sm">{paperPercent}%</span>
      </div>
      <div className="mt-3">
        <ProgressBar percent={paperPercent} />
      </div>

      <div className="mt-6">
        {paper.chapters.length === 0 ? (
          <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
            <p className="text-text-secondary text-sm">No chapters added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {paper.chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                percent={computeChapterProgress(chapter.topics, topicProgressByTopicId)}
                status={chapterMasteryByChapterId.get(chapter.id)?.status ?? "NOT_STARTED"}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
