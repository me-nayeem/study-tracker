import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getPlaylistWatchData } from "@/lib/content-data";
import { PlaylistWatchClient } from "@/components/student/playlist-watch-client";

export default async function PlaylistWatchPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const playlist = await getPlaylistWatchData(playlistId, profile.id, profile.trackId);

  if (!playlist) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/chapter/${playlist.chapter.id}`}
        className="text-text-secondary hover:text-foreground text-sm"
      >
        ← Back to chapter
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-4 text-xl">{playlist.title}</h1>

      {playlist.videos.length === 0 ? (
        <p className="text-text-secondary text-sm">No videos added to this playlist yet.</p>
      ) : (
        <PlaylistWatchClient videos={playlist.videos} />
      )}
    </div>
  );
}
