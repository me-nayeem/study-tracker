"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`text-state-warning hover:bg-state-warning/10 border-state-warning/40 inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${className}`}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
