"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { PanelLeftClose, PanelLeftOpen, LogOut, X } from "lucide-react";
import { STUDENT_NAV } from "@/lib/nav-config";

export function StudentSidebar({
  open,
  collapsed,
  onNavigate,
  onToggleCollapse,
}: {
  open: boolean;
  collapsed: boolean;
  onNavigate: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`border-bg-elevated bg-bg-surface fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col border-r transition-all duration-300 ease-out md:translate-x-0 ${
        collapsed ? "md:w-[76px]" : "md:w-64"
      } ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="border-bg-elevated flex h-[61px] items-center justify-between border-b px-4">
        <button
          onClick={onToggleCollapse}
          className="text-text-secondary hover:text-foreground hover:bg-bg-elevated hidden rounded-lg p-2 md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={onNavigate}
          className="text-text-secondary hover:text-foreground p-1 md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {STUDENT_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                collapsed ? "md:justify-center" : ""
              } ${
                active
                  ? "bg-bg-elevated text-foreground"
                  : "text-text-secondary hover:bg-bg-elevated/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                  collapsed ? "md:hidden" : ""
                } ${
                  active
                    ? "bg-accent-primary scale-100 shadow-[0_0_6px_rgba(217,113,75,0.7)]"
                    : "bg-text-secondary/40 scale-75 group-hover:scale-100"
                }`}
              />
              <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-bg-elevated border-t px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Sign out" : undefined}
          className={`text-text-secondary hover:text-foreground hover:bg-bg-elevated flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
