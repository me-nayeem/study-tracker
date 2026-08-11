"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Free vs Pro", href: "#pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-bg-elevated bg-bg-surface sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-20 md:px-16">
        <Link href="/" className="font-display text-foreground text-base md:text-lg">
          HSC Study Tracker
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-text-secondary hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="bg-accent-primary text-foreground hidden rounded-full px-5 py-2 text-sm font-medium transition-transform active:scale-[0.98] md:inline-block"
        >
          Get started
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="text-foreground -mr-2 p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-bg-elevated bg-bg-surface border-t px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-text-secondary hover:text-foreground text-sm"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="bg-accent-primary text-foreground mt-2 rounded-full px-5 py-2.5 text-center text-sm font-medium"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
