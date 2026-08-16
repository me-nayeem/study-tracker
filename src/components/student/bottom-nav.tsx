"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlayCircle, Trophy, ListChecks, User } from "lucide-react";

const BOTTOM_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lectures", href: "/lectures", icon: PlayCircle },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Results", href: "/quiz-results", icon: ListChecks },
  { label: "Profile", href: "/account", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-bg-surface border-bg-elevated fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 py-2 md:hidden">
      {BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
              active ? "text-accent-primary" : "text-text-secondary"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
