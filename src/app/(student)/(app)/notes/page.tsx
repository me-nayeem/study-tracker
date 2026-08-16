import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getPublicNotesFeed } from "@/lib/content-data";
import { NoteFeedCard } from "@/components/student/note-feed-card";

export default async function NotesFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ chapterId?: string }>;
}) {
  const { chapterId } = await searchParams;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const notes = await getPublicNotesFeed(profile.trackId, profile.id, chapterId);

  return (
    <div>
      {chapterId && (
        <Link
          href={`/chapter/${chapterId}`}
          className="text-text-secondary hover:text-foreground text-sm"
        >
          ← Back to chapter
        </Link>
      )}
      <h1 className="font-display text-foreground mt-2 text-2xl">Community Notes</h1>
      <p className="text-text-secondary mt-1 text-sm">
        Notes shared by students in your track, ranked by likes and ratings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {notes.length === 0 ? (
          <p className="text-text-secondary text-sm md:col-span-2">No shared notes yet.</p>
        ) : (
          notes.map((note) => <NoteFeedCard key={note.id} note={note} />)
        )}
      </div>
    </div>
  );
}
