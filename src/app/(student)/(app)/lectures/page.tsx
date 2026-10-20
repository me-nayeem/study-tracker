import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getTrackFilterOptions, getPlaylistsIndexForTrack } from "@/lib/content-data";
import { CHAPTER_SECTIONS } from "@/lib/chapter-sections";
import { LecturesFilter } from "@/components/student/lectures-filter";
import { LecturesList } from "@/components/student/lectures-list";

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
      <section
        className="border-gold/20 from-bg-surface to-ink relative overflow-hidden rounded-2xl border bg-linear-to-b p-4 sm:p-6"
        style={{ "--card-accent": meta.accent } as React.CSSProperties}
      >
        <span className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-(--card-accent) opacity-20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="border-gold/30 relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-black/40">
            <span className="absolute h-8 w-8 rounded-full bg-(--card-accent) opacity-30 blur-md" />
            <span aria-hidden="true" className="relative text-2xl leading-none">
              {meta.emoji}
            </span>
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

        <div className="relative mt-5">
          <LecturesFilter options={options} />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-foreground text-lg">Playlists</h2>
        <span className="text-gold-soft/70 text-xs tracking-wider uppercase">
          {playlists.length} found
        </span>
      </div>

      <LecturesList playlists={playlists} />
    </div>
  );
}
