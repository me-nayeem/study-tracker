import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile } from "@/lib/student-data";
import { prisma } from "@/lib/prisma";
import { ComingSoon } from "@/components/student/coming-soon";
import { getSubscribedFeatureKeys } from "@/lib/feature-subscriptions";

export default async function TopicExamPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);
  if (!profile) redirect("/onboarding");

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, isArchived: false },
    select: {
      chapterId: true,
      chapter: { select: { paper: { select: { subject: { select: { trackId: true } } } } } },
    },
  });

  if (!topic || topic.chapter.paper.subject.trackId !== profile.trackId) {
    notFound();
  }

  return (
    <ComingSoon
      title="Topic exam"
      backHref={`/chapter/${topic.chapterId}`}
      backLabel="Back to chapter"
      featureKey="chapter:topic-exams"
      subscribed={(await getSubscribedFeatureKeys(user.id)).includes("chapter:topic-exams")}
    />
  );
}
