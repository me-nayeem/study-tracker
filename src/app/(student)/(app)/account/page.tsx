import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FileText, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { hasProAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/student/account-form";
import { StatsHeader } from "@/components/student/stats-header";
import { SignOutButton } from "@/components/student/sign-out-button";

const MORE_LINKS = [
  { label: "Send feedback", href: "/feedback", icon: MessageSquareText },
  { label: "Contact us", href: "/contact", icon: Mail },
  { label: "Privacy policy", href: "/privacy", icon: ShieldCheck },
  { label: "Terms of service", href: "/terms", icon: FileText },
];

export default async function AccountPage() {
  const viewer = await getViewer();
  // (app) layout guarantees a signed-in student
  if (viewer.kind !== "student") return null;
  const { user, profile } = viewer;

  const [isPro, track] = await Promise.all([
    hasProAccess(profile.id),
    prisma.track.findUnique({ where: { id: profile.trackId }, select: { name: true } }),
  ]);

  const displayName = user.name ?? user.email ?? "Student";
  const memberSince = profile.createdAt.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl space-y-6">
      <section className="card-surface p-4 sm:p-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={64}
              height={64}
              className="ring-gold/40 h-16 w-16 shrink-0 rounded-full object-cover ring-2"
            />
          ) : (
            <span className="card-well text-foreground flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-foreground truncate text-2xl leading-tight">
              {displayName}
            </h1>
            <p className="text-text-secondary truncate text-sm">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2.5 py-0.5 font-semibold ${
                  isPro ? "bg-gold/15 text-gold" : "text-foreground/75 bg-white/6"
                }`}
              >
                {isPro ? "Pro" : "Free"}
              </span>
              {track && (
                <span className="text-foreground/75 rounded-full bg-white/6 px-2.5 py-0.5 font-medium">
                  {track.name}
                </span>
              )}
              <span className="text-text-secondary">Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </section>

      <StatsHeader
        totalPoints={profile.totalPoints}
        level={profile.level}
        streakCount={profile.streakCount}
      />

      <section className="card-surface p-4 sm:p-6">
        <h2 className="font-display text-foreground text-lg">Profile details</h2>
        <p className="text-text-secondary mb-5 text-xs sm:text-sm">
          Your institution and board appear next to your name on the leaderboard.
        </p>
        <AccountForm user={{ name: user.name, email: user.email }} profile={profile} />
      </section>

      <section className="card-surface overflow-hidden">
        <h2 className="font-display text-foreground px-4 pt-4 text-lg sm:px-6 sm:pt-5">More</h2>
        <ul className="mt-2 divide-y divide-white/6">
          {MORE_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-white/4 sm:px-6"
              >
                <span className="card-well text-gold flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <link.icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{link.label}</span>
                <ChevronRight className="text-foreground/40 h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="pb-2">
        <SignOutButton className="w-full sm:w-auto" />
      </div>
    </div>
  );
}
