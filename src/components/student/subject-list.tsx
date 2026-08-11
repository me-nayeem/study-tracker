import Link from "next/link";
import type { MasteryStatus } from "@/generated/prisma/enums";
import type { StudentDashboardData, StudentDashboardChapter } from "@/lib/student-data";
import { computeChapterProgress, computeSubjectProgress } from "@/lib/progress";
import { ProgressBar } from "./progress-bar";
import { MasteryBadge } from "./mastery-badge";

export function SubjectList({ data }: { data: StudentDashboardData }) {
  const { track, topicProgressByTopicId, chapterMasteryByChapterId } = data;

  if (!track || track.subjects.length === 0) {
    return (
      <div className="bg-bg-surface border-bg-elevated rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">
          No subjects have been added to your track yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {track.subjects.map((subject) => {
        const allChapters = subject.papers.flatMap((paper) => paper.chapters);
        const subjectPercent = computeSubjectProgress(allChapters, topicProgressByTopicId);

        return (
          <div key={subject.id} className="bg-bg-surface border-bg-elevated rounded-xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-foreground text-lg">{subject.name}</h2>
              <span className="text-text-secondary font-mono text-xs">{subjectPercent}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar percent={subjectPercent} />
            </div>

            {subject.papers.length === 0 ? (
              <p className="text-text-secondary mt-4 text-sm">No papers added yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {subject.papers.map((paper) => (
                  <div key={paper.id}>
                    <h3 className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                      {paper.name}
                    </h3>

                    {paper.chapters.length === 0 ? (
                      <p className="text-text-secondary mt-1.5 text-sm">No chapters added yet.</p>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5">
                        {paper.chapters.map((chapter) => (
                          <ChapterRow
                            key={chapter.id}
                            chapter={chapter}
                            percent={computeChapterProgress(chapter.topics, topicProgressByTopicId)}
                            status={chapterMasteryByChapterId.get(chapter.id)?.status ?? "NOT_STARTED"}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChapterRow({
  chapter,
  percent,
  status,
}: {
  chapter: StudentDashboardChapter;
  percent: number;
  status: MasteryStatus;
}) {
  return (
    <li>
      <Link
        href={`/chapter/${chapter.id}`}
        className="bg-bg-elevated hover:bg-bg-elevated/70 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
      >
        <span className="text-foreground min-w-0 truncate">{chapter.name}</span>
        <span className="flex shrink-0 items-center gap-3">
          <MasteryBadge status={status} />
          <span className="text-text-secondary w-10 text-right font-mono text-xs">{percent}%</span>
        </span>
      </Link>
    </li>
  );
}