"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { STUDENT_NAV } from "@/lib/nav-config";

export function StudentSidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`border-bg-elevated bg-bg-surface fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col border-r transition-transform duration-300 ease-out md:static md:z-auto md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-bg-elevated flex items-center justify-between border-b px-6 py-5">
        <span className="font-display text-foreground text-base leading-none">
          HSC Study Tracker
        </span>
        <button
          onClick={onNavigate}
          className="text-text-secondary hover:text-foreground -mr-1 p-1 md:hidden"
          aria-label="Close menu"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {STUDENT_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === item.href
                ? "bg-bg-elevated text-foreground"
                : "text-text-secondary hover:bg-bg-elevated/60 hover:text-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                pathname === item.href
                  ? "bg-accent-primary scale-100 shadow-[0_0_6px_rgba(217,113,75,0.7)]"
                  : "bg-text-secondary/40 scale-75 group-hover:scale-100"
              }`}
            />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-bg-elevated border-t px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-text-secondary hover:text-foreground hover:bg-bg-elevated w-full rounded-lg px-3 py-2 text-left text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
