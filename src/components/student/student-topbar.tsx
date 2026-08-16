import Link from "next/link";
import Image from "next/image";
import { User, Menu } from "lucide-react";

export function StudentTopbar({
  name,
  email,
  image,
  onMenuClick,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onMenuClick: () => void;
}) {
  return (
    <header className="border-bg-elevated bg-bg-surface/60 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenuClick}
          className="text-foreground -ml-2 p-2 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/dashboard"
          className="font-display text-foreground truncate text-base leading-none"
        >
          HSC Study Tracker
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="bg-bg-elevated text-text-secondary rounded-full px-2.5 py-1 text-xs font-medium">
          Free
        </span>
        <Link
          href="/account"
          className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
          aria-label="Account settings"
        >
          <div className="hidden min-w-0 text-right sm:block">
            <p className="text-foreground max-w-[160px] truncate text-sm font-medium">
              {name ?? email}
            </p>
            <p className="text-text-secondary text-xs">Student</p>
          </div>
          {image ? (
            <Image src={image} alt="" width={36} height={36} className="rounded-full" />
          ) : (
            <div className="bg-bg-elevated text-text-secondary flex h-9 w-9 items-center justify-center rounded-full">
              <User className="h-4 w-4" />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
