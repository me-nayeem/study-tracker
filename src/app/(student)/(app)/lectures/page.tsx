import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getTrackFilterOptions, getPlaylistsIndexForTrack } from "@/lib/content-data";
import { CHAPTER_SECTIONS } from "@/lib/chapter-sections";
import { LecturesFilter } from "@/components/student/lectures-filter";
import { LecturesList } from "@/components/student/lectures-list";
import { headerTileClass } from "@/components/shared/classes";

export default async function LecturesPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string; paperId?: string; chapterId?: string; q?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [options, playlists] = await Promise.all([
    getTrackFilterOptions(profile.trackId),
    getPlaylistsIndexForTrack(profile.trackId, {
      subjectId: params.subjectId,
      paperId: params.paperId,
      chapterId: params.chapterId,
      q: params.q,
    }),
  ]);

  const meta = CHAPTER_SECTIONS.lectures;

  return (
    <div className="space-y-6">
      <section className="card-surface p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={headerTileClass}>
            {meta.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
              Lectures
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              Browse all curated playlists across your track.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <LecturesFilter options={options} />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-foreground text-lg">Playlists</h2>
        <span className="text-text-secondary text-xs">{playlists.length} found</span>
      </div>

      <LecturesList playlists={playlists} />
    </div>
  );
}
