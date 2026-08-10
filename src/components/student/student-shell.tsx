"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "./student-sidebar";
import { StudentTopbar } from "./student-topbar";

export function StudentShell({
  name,
  email,
  children,
}: {
  name?: string | null;
  email?: string | null;
  children: React.ReactNode;
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

      <StudentSidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <StudentTopbar name={name} email={email} onMenuClick={() => setMobileOpen((v) => !v)} />
        <main className="animate-card-in flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
