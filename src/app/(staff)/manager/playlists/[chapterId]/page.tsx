import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getChapterForStaff } from "@/lib/curriculum-data";
import { getPlaylistsForChapter } from "@/lib/content-data";
import { PlaylistManager } from "@/components/staff/content/playlist-list";

export default async function ChapterPlaylistsPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const { chapterId } = await params;

  const chapter = await getChapterForStaff(chapterId);
  if (!chapter) {
    notFound();
  }

  const playlists = await getPlaylistsForChapter(chapterId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-text-secondary text-xs">
          {chapter.paper.subject.track.name} · {chapter.paper.subject.name} · {chapter.paper.name}
        </p>
        <h1 className="font-display text-foreground text-2xl">{chapter.name}</h1>
        <p className="text-text-secondary mt-1 text-sm">Curated playlists for this chapter.</p>
      </div>

      <PlaylistManager chapterId={chapterId} playlists={playlists} />
    </div>
  );
}
