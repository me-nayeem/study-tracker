import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getTrackFilterOptions, getPlaylistsIndexForTrack } from "@/lib/content-data";
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

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl">Lectures</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Browse all curated playlists across your track.
      </p>

      <div className="mt-5">
        <LecturesFilter options={options} />
      </div>

      <div className="mt-5">
        <LecturesList playlists={playlists} />
      </div>
    </div>
  );
}
