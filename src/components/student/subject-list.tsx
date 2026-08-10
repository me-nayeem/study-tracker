import type { StudentDashboardTrack } from "@/lib/student-data";

export function SubjectList({ track }: { track: StudentDashboardTrack }) {
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
      {track.subjects.map((subject) => (
        <div key={subject.id} className="bg-bg-surface border-bg-elevated rounded-xl border p-5">
          <h2 className="font-display text-foreground text-lg">{subject.name}</h2>

          {subject.papers.length === 0 ? (
            <p className="text-text-secondary mt-2 text-sm">No papers added yet.</p>
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
                    <ul className="mt-1.5 space-y-1">
                      {paper.chapters.map((chapter) => (
                        <li
                          key={chapter.id}
                          className="bg-bg-elevated text-foreground rounded-lg px-3 py-2 text-sm"
                        >
                          {chapter.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
