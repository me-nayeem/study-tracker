"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { subscribeToFeature } from "@/actions/feature-subscriptions";
import { COMING_SOON_FEATURES, type FeatureKey } from "@/lib/coming-soon";
import { useToast } from "@/components/shared/dialog-provider";

/**
 * "Notify me" for a coming-soon feature. Once subscribed the button is replaced
 * by an "on the list" message.
 *
 * - `card`: compact, for small floating cards
 * - `panel`: roomier, for full-width coming-soon panels
 */
export function NotifyMeButton({
  featureKey,
  initialSubscribed,
  variant = "panel",
}: {
  featureKey: FeatureKey;
  initialSubscribed: boolean;
  variant?: "card" | "panel";
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const featureName = COMING_SOON_FEATURES[featureKey];

  function handleClick(e: React.MouseEvent) {
    // cards may sit inside clickable parents
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await subscribeToFeature(featureKey);
      if (result.success) {
        setSubscribed(true);
        toast(
          `You're on the list! We'll let you know as soon as ${featureName} is live.`,
          "success"
        );
      } else {
        toast(result.error ?? "Couldn't save that. Please try again.");
      }
    });
  }

  if (subscribed) {
    return variant === "card" ? (
      <span className="text-state-success inline-flex items-center gap-1 text-[10px] leading-tight font-semibold @min-[200px]:text-xs">
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        You&apos;re on the list
      </span>
    ) : (
      <p className="border-state-success/30 bg-state-success/10 text-state-success inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        You&apos;re on the list — we&apos;ll inform you as soon as it&apos;s live.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        variant === "card"
          ? "from-gold-soft to-gold text-ink relative z-10 inline-flex items-center gap-1 rounded-full bg-linear-to-b px-2.5 py-1 text-[10px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-60 @min-[200px]:text-xs"
          : "from-gold-soft to-gold text-ink inline-flex items-center gap-2 rounded-xl bg-linear-to-b px-5 py-2.5 text-sm font-semibold shadow-[0_8px_24px_-10px_rgba(214,166,72,0.7)] transition-transform active:scale-[0.98] disabled:opacity-60"
      }
    >
      <Bell className={variant === "card" ? "h-3 w-3" : "h-4 w-4"} />
      {isPending ? "Saving…" : "Notify me"}
    </button>
  );
}
