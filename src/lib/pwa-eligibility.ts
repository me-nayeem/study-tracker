const DISMISS_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000;

export function isInstallPromptEligible(
  profile: { pwaInstalled: boolean; pwaInstallDismissedAt: Date | null },
  now: Date
): boolean {
  if (profile.pwaInstalled) return false;
  if (!profile.pwaInstallDismissedAt) return true;
  return now.getTime() - profile.pwaInstallDismissedAt.getTime() >= DISMISS_COOLDOWN_MS;
}
