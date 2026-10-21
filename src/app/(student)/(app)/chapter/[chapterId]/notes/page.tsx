import { FileText, NotebookPen } from "lucide-react";
import { requireStudentChapter } from "@/lib/chapter-page";
import { hasChapterCoreAccess, hasProAccess } from "@/lib/access";
import {
  getOfficialNotesForChapterStudentView,
  getStudentNotesForChapterOwner,
} from "@/lib/content-data";
import { ChapterSubpageHeader } from "@/components/student/chapter-subpage-header";
import { LockedSectionNotice } from "@/components/student/locked-section-notice";
import { OfficialNoteSection } from "@/components/student/official-note-section";
import { StudentNoteSection } from "@/components/student/student-note-section";

export default async function ChapterNotesPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const { profile, chapter } = await requireStudentChapter(chapterId);
  const hasCoreAccess = await hasChapterCoreAccess(profile.id, chapter);

  if (!hasCoreAccess) {
    return (
      <div className="max-w-3xl">
        <ChapterSubpageHeader section="notes" chapter={chapter} />
        <LockedSectionNotice label="Notes" />
      </div>
    );
  }

  const [officialNotes, isProUnlocked, ownNotes] = await Promise.all([
    getOfficialNotesForChapterStudentView(chapterId),
    hasProAccess(profile.id),
    getStudentNotesForChapterOwner(chapterId, profile.id),
  ]);

  return (
    <div className="max-w-5xl">
      <ChapterSubpageHeader section="notes" chapter={chapter} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NotesPanel icon={FileText} title="Official notes" accentClass="text-accent-purple">
          <OfficialNoteSection notes={officialNotes} isProUnlocked={isProUnlocked} />
        </NotesPanel>
        <NotesPanel icon={NotebookPen} title="My notes" accentClass="text-accent-gamify">
          <StudentNoteSection chapterId={chapter.id} ownNotes={ownNotes} />
        </NotesPanel>
      </div>
    </div>
  );
}

function NotesPanel({
  icon: Icon,
  title,
  accentClass,
  children,
}: {
  icon: typeof FileText;
  title: string;
  accentClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-4">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ${accentClass}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-foreground text-base">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
