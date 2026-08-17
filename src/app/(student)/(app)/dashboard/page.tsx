import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getStudentProfile, getStudentDashboardData } from "@/lib/student-data";
import { getUnreadChapterReviewNotices } from "@/lib/notifications-data";
import { prisma } from "@/lib/prisma";
import { evaluateStreak } from "@/lib/streaks";
import { SubjectList } from "@/components/student/subject-list";
import { FailedQuizNoticeBoard } from "@/components/student/failed-quiz-notice-board";
import { StatsHeader } from "@/components/student/stats-header";
import { StreakCelebrationModal } from "@/components/student/streak-celebration-modal";
import { evaluateLevelUpForDisplay } from "@/lib/level";
import { LevelUpModal } from "@/components/student/level-up-modal";
import { PwaInstallController } from "@/components/student/pwa-install-controller";
import { isInstallPromptEligible } from "@/lib/pwa-eligibility";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getStudentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [data, notices, streakResult, levelUpResult] = await Promise.all([
    getStudentDashboardData(profile.trackId, profile.id),
    getUnreadChapterReviewNotices(user.id),
    prisma.$transaction((tx) => evaluateStreak(tx, profile.id, new Date())),
    prisma.$transaction((tx) => evaluateLevelUpForDisplay(tx, profile.id)),
  ]);

  const displayTotalPoints = profile.totalPoints + streakResult.pointsAwarded;
  const pwaEligible = isInstallPromptEligible(profile, new Date());

  const showLevelUp = levelUpResult.shouldShow;
  const showStreak = streakResult.awarded && !showLevelUp;

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl">Dashboard</h1>
      <p className="text-text-secondary mt-1 text-sm">{data.track?.name}</p>

      <StatsHeader
        totalPoints={displayTotalPoints}
        level={profile.level}
        streakCount={streakResult.streakCount}
      />

      {notices.length > 0 && (
        <div className="mt-4">
          <FailedQuizNoticeBoard notices={notices} />
        </div>
      )}

      <div className="mt-6">
        <SubjectList data={data} />
      </div>

      {showLevelUp && <LevelUpModal level={levelUpResult.level!} title={levelUpResult.title} />}

      {showStreak && (
        <StreakCelebrationModal
          streakCount={streakResult.streakCount}
          pointsAwarded={streakResult.pointsAwarded}
        />
      )}

      <PwaInstallController
        eligible={pwaEligible}
        suppressForStreak={streakResult.awarded || showLevelUp}
      />
    </div>
  );
}
