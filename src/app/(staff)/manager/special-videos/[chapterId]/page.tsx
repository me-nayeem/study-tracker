import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getChapterForStaff } from "@/lib/curriculum-data";
import { getSpecialVideosForChapter } from "@/lib/content-data";
import { SpecialVideoManager } from "@/components/staff/content/special-video-list";

export default async function ChapterSpecialVideosPage({
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

  const videos = await getSpecialVideosForChapter(chapterId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-text-secondary text-xs">
          {chapter.paper.subject.track.name} · {chapter.paper.subject.name} · {chapter.paper.name}
        </p>
        <h1 className="font-display text-foreground text-2xl">{chapter.name}</h1>
        <p className="text-text-secondary mt-1 text-sm">Tagged special videos for this chapter.</p>
      </div>

      <SpecialVideoManager chapterId={chapterId} videos={videos} />
    </div>
  );
}
