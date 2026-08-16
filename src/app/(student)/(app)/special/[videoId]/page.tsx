import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { getSpecialVideoWatchData } from "@/lib/content-data";
import { SpecialVideoWatchClient } from "@/components/student/special-video-watch-client";

export default async function SpecialVideoWatchPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const data = await getSpecialVideoWatchData(videoId, profile.trackId);
  if (!data) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/chapter/${data.chapter.id}`}
        className="text-text-secondary hover:text-foreground text-sm"
      >
        ← Back to chapter
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-4 text-xl">Special Videos</h1>

      <SpecialVideoWatchClient videos={data.videos} initialVideoId={videoId} />
    </div>
  );
}
