import { getViewer, type Viewer } from "@/lib/viewer";
import { getStudentDashboardData } from "@/lib/student-data";
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
import { getSubscribedFeatureKeys } from "@/lib/feature-subscriptions";
import { SignInBanner } from "@/components/student/sign-in-banner";
import { AppCredits } from "@/components/shared/app-credits";

export default async function DashboardPage() {
  const viewer = await getViewer();
  return viewer.kind === "guest" ? (
    <GuestDashboard trackId={viewer.trackId} />
  ) : (
    <StudentDashboard viewer={viewer} />
  );
}

/** Visitors: the same subject cards, without progress, and a sign-in prompt. */
async function GuestDashboard({ trackId }: { trackId: string | null }) {
  const data = trackId
    ? await getStudentDashboardData(trackId, null)
    : {
        track: null,
        topicProgressByTopicId: new Map(),
        chapterMasteryByChapterId: new Map(),
      };

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl">Dashboard</h1>
      <p className="text-text-secondary mt-1 text-sm">{data.track?.name}</p>

      <div className="mt-4 max-w-3xl">
        <SignInBanner returnTo="/dashboard" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-foreground text-lg">Subjects</h2>
          <p className="text-text-secondary text-xs">Tap a card to choose a paper</p>
        </div>
        <SubjectList data={data} subscribedKeys={[]} guest />
      </div>

      <AppCredits className="mt-8 max-w-6xl" />
    </div>
  );
}

async function StudentDashboard({ viewer }: { viewer: Extract<Viewer, { kind: "student" }> }) {
  const { user, profile } = viewer;

  const [data, notices, { streakResult, levelUpResult }, subscribedKeys] = await Promise.all([
    getStudentDashboardData(profile.trackId, profile.id),
    getUnreadChapterReviewNotices(user.id),
    // one transaction, in order: the streak bonus can raise the level, so check level-up after it
    prisma.$transaction(async (tx) => {
      const streakResult = await evaluateStreak(tx, profile.id, new Date());
      const levelUpResult = await evaluateLevelUpForDisplay(tx, profile.id);
      return { streakResult, levelUpResult };
    }),
    getSubscribedFeatureKeys(user.id),
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

      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-foreground text-lg">Your subjects</h2>
          <p className="text-text-secondary text-xs">Tap a card to choose a paper</p>
        </div>
        <SubjectList data={data} subscribedKeys={subscribedKeys} />
      </div>

      <AppCredits className="mt-8 max-w-6xl" />

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
