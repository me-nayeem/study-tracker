import { requireRole } from "@/lib/dal";
import { searchChaptersForPicker } from "@/lib/curriculum-data";
import { ChapterSearchInput } from "@/components/staff/shared/chapter-search-input";
import { ChapterPickerList } from "@/components/staff/shared/chapter-picker-list";

export default async function OfficialNotesPickerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN", "MANAGER"]);
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const chapters = await searchChaptersForPicker(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Official notes</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Search for a chapter to manage its Pro personalized notes.
        </p>
      </div>

      <ChapterSearchInput placeholder="Search by chapter name…" />

      <ChapterPickerList chapters={chapters} basePath="/manager/official-notes" query={query} />
    </div>
  );
}
