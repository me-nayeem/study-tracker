import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { FeatureKey } from "@/lib/coming-soon";
import { NotifyMeButton } from "@/components/shared/notify-me-button";

/** Themed "coming soon" panel, optionally with a "Notify me" waitlist button. */
export function ComingSoonPanel({
  emoji = "⏳",
  title,
  message,
  featureKey,
  subscribed = false,
}: {
  emoji?: string;
  title: string;
  message: string;
  featureKey?: FeatureKey;
  subscribed?: boolean;
}) {
  return (
    <div className="border-gold/20 from-bg-surface to-ink rounded-2xl border bg-linear-to-b px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden="true">
        {emoji}
      </p>
      <p className="font-display text-foreground mt-3 text-xl">{title}</p>
      <p className="text-text-secondary mx-auto mt-1.5 max-w-sm text-sm">{message}</p>
      {featureKey && (
        <div className="mt-5">
          <NotifyMeButton featureKey={featureKey} initialSubscribed={subscribed} />
        </div>
      )}
    </div>
  );
}

export function ComingSoon({
  title,
  backHref,
  backLabel,
  featureKey,
  subscribed,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  featureKey?: FeatureKey;
  subscribed?: boolean;
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <Link
        href={backHref}
        className="border-gold/30 text-gold-soft/80 hover:border-gold hover:text-gold-soft inline-flex items-center gap-1 rounded-full border bg-black/30 py-1 pr-3 pl-2 text-xs transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        {backLabel}
      </Link>
      <ComingSoonPanel
        emoji="✨"
        title={title}
        message="This is coming soon. Join the list and we'll let you know when it's ready."
        featureKey={featureKey}
        subscribed={subscribed}
      />
    </div>
  );
}
