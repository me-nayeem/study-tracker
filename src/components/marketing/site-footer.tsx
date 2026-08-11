import Link from "next/link";
import { DEVELOPERS } from "@/lib/developers";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-surface border-bg-elevated border-t px-6 py-12 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <span className="font-display text-foreground text-lg">HSC Study Tracker</span>
            <p className="text-text-secondary mt-2 max-w-xs text-sm">
              Chapter-by-chapter progress, real exam breakdowns, and a plan instead of guesswork.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h3 className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                Product
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#how-it-works" className="text-text-secondary hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-text-secondary hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-text-secondary hover:text-foreground">
                    Free vs Pro
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                Account
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-text-secondary hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/developer" className="text-text-secondary hover:text-foreground">
                    Developers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-bg-elevated mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-text-secondary">
            © {year} HSC Study Tracker. All rights reserved.
          </span>
          <span className="text-text-secondary">
            Built by {DEVELOPERS.map((d) => d.name).join(" & ")}
          </span>
        </div>
      </div>
    </footer>
  );
}
