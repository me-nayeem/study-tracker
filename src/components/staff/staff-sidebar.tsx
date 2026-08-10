"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { STAFF_NAV, type StaffNavItem } from "@/lib/nav-config";
import type { Role } from "@/generated/prisma/client";

export function StaffSidebar({
  role,
  open,
  onNavigate,
}: {
  role: Role;
  open: boolean;
  onNavigate: () => void;
}) {
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

      <div className="px-6 pt-4 pb-2">
        <RoleBadge role={role} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {STAFF_NAV.filter((entry) =>
          entry.type === "link" ? entry.item.roles.includes(role) : entry.group.roles.includes(role)
        ).map((entry) =>
          entry.type === "link" ? (
            <NavLink
              key={entry.item.href}
              item={entry.item}
              active={pathname === entry.item.href}
              onNavigate={onNavigate}
            />
          ) : (
            <NavGroup
              key={entry.group.label}
              label={entry.group.label}
              items={entry.group.items}
              role={role}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          )
        )}
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

function RoleBadge({ role }: { role: Role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={
        isAdmin
          ? "bg-accent-primary/10 text-accent-primary inline-block rounded-full px-2.5 py-1 text-xs font-medium"
          : "bg-accent-gamify/10 text-accent-gamify inline-block rounded-full px-2.5 py-1 text-xs font-medium"
      }
    >
      {isAdmin ? "Admin" : "Manager"}
    </span>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: StaffNavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-bg-elevated text-foreground"
          : "text-text-secondary hover:bg-bg-elevated/60 hover:text-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
          active
            ? "bg-accent-primary scale-100 shadow-[0_0_6px_rgba(217,113,75,0.7)]"
            : "bg-text-secondary/40 scale-75 group-hover:scale-100"
        }`}
      />
      {item.label}
    </Link>
  );
}

function NavGroup({
  label,
  items,
  role,
  pathname,
  onNavigate,
}: {
  label: string;
  items: StaffNavItem[];
  role: Role;
  pathname: string;
  onNavigate: () => void;
}) {
  const visibleItems = items.filter((item) => item.roles.includes(role));
  const hasActiveChild = visibleItems.some((item) => item.href === pathname);
  const [open, setOpen] = useState<boolean>(hasActiveChild);

  if (visibleItems.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-text-secondary hover:text-foreground flex w-full items-center justify-between px-3 py-2 text-xs font-medium tracking-wide uppercase transition-colors"
      >
        {label}
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
        >
          <path
            d="M4 2l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="space-y-1 overflow-hidden pl-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
