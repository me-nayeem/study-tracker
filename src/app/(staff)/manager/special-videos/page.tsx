import { requireRole } from "@/lib/dal";
import { searchChaptersForPicker } from "@/lib/curriculum-data";
import { ChapterSearchInput } from "@/components/staff/shared/chapter-search-input";
import { ChapterPickerList } from "@/components/staff/shared/chapter-picker-list";

export default async function SpecialVideosPickerPage({
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
        <h1 className="font-display text-foreground text-2xl">Special videos</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Search for a chapter to manage its tagged special videos.
        </p>
      </div>

      <ChapterSearchInput placeholder="Search by chapter name…" />

      <ChapterPickerList chapters={chapters} basePath="/manager/special-videos" query={query} />
    </div>
  );
}
