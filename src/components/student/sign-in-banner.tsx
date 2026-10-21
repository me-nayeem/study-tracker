import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";
import { buttonGoldClass } from "@/components/shared/classes";
import { loginHref } from "@/lib/login-redirect";

/** Shown to visitors in place of student-only content; signing in returns them to `returnTo`. */
export function SignInBanner({
  returnTo,
  title = "Sign in to track your progress",
  message = "Save checklists, take chapter quizzes, earn points and climb the leaderboard.",
}: {
  returnTo: string;
  title?: string;
  message?: string;
}) {
  return (
    <section className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="bg-gold/10 text-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-foreground text-sm font-semibold sm:text-base">{title}</p>
          <p className="text-text-secondary text-xs sm:text-sm">{message}</p>
        </div>
      </div>
      <Link href={loginHref(returnTo)} className={`${buttonGoldClass} shrink-0`}>
        <LogIn className="h-4 w-4" />
        Sign in
      </Link>
    </section>
  );
}
