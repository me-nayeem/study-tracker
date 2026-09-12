"use client";

import { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { StudentSidebar } from "./student-sidebar";
import { StudentTopbar } from "./student-topbar";
import { BottomNav } from "./bottom-nav";
import { BackForwardRefresh } from "./back-forward-refresh";

const COLLAPSE_KEY = "student-sidebar-collapsed";
const COLLAPSE_EVENT = "student-sidebar-collapsed-change";

function subscribe(callback: () => void) {
  window.addEventListener(COLLAPSE_EVENT, callback);
  return () => window.removeEventListener(COLLAPSE_EVENT, callback);
}

function getSnapshot() {
  return localStorage.getItem(COLLAPSE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

function setCollapsedPersisted(next: boolean) {
  localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  window.dispatchEvent(new Event(COLLAPSE_EVENT));
}

export function StudentShell({
  name,
  email,
  image,
  isProActive,
  children,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isProActive: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = useCallback(() => {
    setCollapsedPersisted(!collapsed);
  }, [collapsed]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="bg-background min-h-screen">
      <BackForwardRefresh />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <StudentSidebar
        open={mobileOpen}
        collapsed={collapsed}
        onNavigate={() => setMobileOpen(false)}
        onToggleCollapse={toggleCollapse}
      />

      <div
        className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-out ${
          collapsed ? "md:ml-[76px]" : "md:ml-64"
        }`}
      >
        <StudentTopbar
          name={name}
          email={email}
          image={image}
          isProActive={isProActive}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        <main className="animate-card-in flex-1 px-4 py-6 pb-20 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
