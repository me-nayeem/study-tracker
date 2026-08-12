import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getChapterForStaff } from "@/lib/curriculum-data";
import { getOfficialNotesForChapter } from "@/lib/content-data";
import { OfficialNoteManager } from "@/components/staff/content/official-note-list";

export default async function ChapterOfficialNotesPage({
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

  const notes = await getOfficialNotesForChapter(chapterId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-text-secondary text-xs">
          {chapter.paper.subject.track.name} · {chapter.paper.subject.name} · {chapter.paper.name}
        </p>
        <h1 className="font-display text-foreground text-2xl">{chapter.name}</h1>
        <p className="text-text-secondary mt-1 text-sm">Pro personalized notes for this chapter.</p>
      </div>

      <OfficialNoteManager chapterId={chapterId} notes={notes} />
    </div>
  );
}
