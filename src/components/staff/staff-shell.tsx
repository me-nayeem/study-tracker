"use client";

import { useEffect, useState, type ReactNode } from "react";
import { StaffSidebar } from "@/components/staff/staff-sidebar";
import { StaffTopbar } from "@/components/staff/staff-topbar";
import type { Role } from "@/generated/prisma/client";

export function StaffShell({
  role,
  name,
  email,
  children,
}: {
  role: Role;
  name?: string | null;
  email?: string | null;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="bg-background flex min-h-screen">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <StaffSidebar role={role} open={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <StaffTopbar
          name={name}
          email={email}
          role={role}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        <main className="animate-card-in flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
