"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { dismissPwaInstallPrompt, markPwaInstalled } from "@/actions/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getStandaloneServerSnapshot(): boolean {
  return false;
}

function subscribeStandalone(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function PwaInstallController({
  eligible,
  suppressForStreak,
}: {
  eligible: boolean;
  suppressForStreak: boolean;
}) {
  const alreadyStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (alreadyStandalone) {
      markPwaInstalled();
    }
  }, [alreadyStandalone]);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const handleInstalled = () => {
      markPwaInstalled();
    };
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const shouldRender = eligible && !suppressForStreak && !dismissed && !alreadyStandalone;

  if (!shouldRender) return null;

  async function handleNotNow() {
    setDismissed(true);
    await dismissPwaInstallPrompt();
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      await markPwaInstalled();
    }
    setDismissed(true);
  }

  async function handleIosConfirm() {
    await markPwaInstalled();
    setDismissed(true);
  }

  const ios = isIos();
  const showManualInstructions = ios || !deferredPrompt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleNotNow}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-card-in border-bg-elevated bg-bg-surface w-full max-w-sm rounded-2xl border p-6 text-center"
      >
        <div className="bg-accent-primary/10 text-accent-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          📲
        </div>

        <p className="font-display text-foreground mt-4 text-xl">Add to Home Screen</p>
        <p className="text-text-secondary mt-2 text-sm">এক ট্যাপে আপনার ড্যাশবোর্ডে যান।</p>

        {showManualInstructions ? (
          <div className="border-bg-elevated bg-bg-elevated/40 mt-4 rounded-lg border p-3 text-left text-xs">
            <p className="text-foreground font-medium">
              {ios ? "আইফোন/আইপ্যাডে:" : "আপনার ব্রাউজার মেনুতে:"}
            </p>
            <p className="text-text-secondary mt-1">
              {ios
                ? 'শেয়ার আইকনে ট্যাপ করুন, তারপর "Add to Home Screen" নির্বাচন করুন।'
                : 'ব্রাউজার মেনু খুলুন এবং "Install app" অথবা "Add to Home screen" নির্বাচন করুন।'}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          {!showManualInstructions && (
            <button
              onClick={handleAndroidInstall}
              className="bg-accent-primary text-background w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              এখনই যোগ করুন
            </button>
          )}
          {showManualInstructions && (
            <button
              onClick={handleIosConfirm}
              className="bg-accent-primary text-background w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              যোগ করেছি
            </button>
          )}
          <button
            onClick={handleNotNow}
            className="text-text-secondary w-full rounded-lg px-4 py-2 text-sm hover:underline"
          >
            এখন না
          </button>
        </div>
      </div>
    </div>
  );
}
