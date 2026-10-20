import { requireStudentChapter } from "@/lib/chapter-page";
import {
  getPlaylistsForChapterStudentView,
  getSpecialVideosForChapterStudentView,
} from "@/lib/content-data";
import { ChapterSubpageHeader } from "@/components/student/chapter-subpage-header";
import { PlaylistSection } from "@/components/student/playlist-section";
import { SpecialVideoSection } from "@/components/student/special-video-section";

export default async function ChapterLecturesPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const { profile, chapter } = await requireStudentChapter(chapterId);

  const [playlists, specialVideos] = await Promise.all([
    getPlaylistsForChapterStudentView(chapterId, profile.id),
    getSpecialVideosForChapterStudentView(chapterId),
  ]);

  return (
    <div>
      <ChapterSubpageHeader section="lectures" chapter={chapter} />

      <PlaylistSection playlists={playlists} />

      {specialVideos.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-foreground mb-4 text-lg">Special videos</h2>
          <SpecialVideoSection videos={specialVideos} />
        </section>
      )}
    </div>
  );
}
