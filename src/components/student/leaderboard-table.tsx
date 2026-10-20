import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard-data";

const PODIUM: Record<1 | 2 | 3, { medal: string; accent: string; ring: string }> = {
  1: { medal: "🥇", accent: "#e3a857", ring: "from-gold-soft via-gold to-gold-deep" },
  2: { medal: "🥈", accent: "#c0c7d1", ring: "from-white via-slate-300 to-slate-500" },
  3: { medal: "🥉", accent: "#cd7f32", ring: "from-orange-200 via-amber-600 to-amber-900" },
};

const YOU_ACCENT = "#d9714b";

function subtitleFor(entry: LeaderboardEntry): string | null {
  if (entry.institutionName && entry.boardLabel) {
    return `${entry.institutionName} · ${entry.boardLabel}`;
  }
  return entry.institutionName ?? entry.boardLabel ?? null;
}

function Avatar({
  image,
  name,
  size,
  ring = "from-gold-soft via-gold to-gold-deep",
}: {
  image: string | null;
  name: string;
  size: number;
  ring?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br p-0.5 ${ring}`}
      style={{ width: size, height: size }}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={size}
          height={size}
          className="bg-ink h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="bg-ink text-gold-soft flex h-full w-full items-center justify-center rounded-full">
          {name ? (
            <span className="font-display text-sm font-semibold">
              {name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="h-4 w-4" />
          )}
        </span>
      )}
    </span>
  );
}

export function LeaderboardTable({
  entries,
  page,
  totalPages,
  pageSize,
  trackStudentCount,
  currentStudentId,
  buildHref,
}: {
  entries: LeaderboardEntry[];
  page: number;
  totalPages: number;
  pageSize: number;
  trackStudentCount: number;
  currentStudentId: string;
  buildHref: (o: { page?: number }) => string;
}) {
  const rangeStart = entries.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = entries.length ? rangeStart + entries.length - 1 : 0;

  const podium = page === 1 ? entries.filter((e) => e.rank <= 3) : [];
  const rest = page === 1 ? entries.filter((e) => e.rank > 3) : entries;

  return (
    <div className="space-y-5">
      <p className="text-text-secondary text-xs">
        Showing {rangeStart}–{rangeEnd} of up to 100 · {trackStudentCount} student(s) in your track
      </p>

      {entries.length === 0 && (
        <div className="border-gold/20 from-bg-surface to-ink rounded-2xl border bg-linear-to-b px-6 py-12 text-center">
          <p className="text-3xl" aria-hidden="true">
            🏁
          </p>
          <p className="font-display text-foreground mt-2 text-lg">No points yet</p>
          <p className="text-text-secondary mt-1 text-sm">
            No one has earned points in this period. Be the first!
          </p>
        </div>
      )}

      {podium.length > 0 && <Podium entries={podium} currentStudentId={currentStudentId} />}

      {rest.length > 0 && (
        <div className="max-w-4xl space-y-4 pb-2">
          {rest.map((entry, index) => (
            <RankRow
              key={entry.studentId}
              entry={entry}
              index={index}
              isYou={entry.studentId === currentStudentId}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex flex-wrap justify-center gap-2" aria-label="Leaderboard pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: p })}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                p === page
                  ? "from-gold-soft to-gold text-ink bg-linear-to-b"
                  : "border-gold/25 text-text-secondary hover:border-gold hover:text-foreground border bg-black/40"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

/** Top three, laid out 2 · 1 · 3 with first place raised. */
function Podium({
  entries,
  currentStudentId,
}: {
  entries: LeaderboardEntry[];
  currentStudentId: string;
}) {
  const byRank = new Map(entries.map((e) => [e.rank, e]));
  const order = [2, 1, 3] as const;

  return (
    <div className="grid max-w-3xl grid-cols-3 items-end gap-2.5 pt-2 pb-3 sm:gap-4">
      {order.map((rank) => {
        const entry = byRank.get(rank);
        if (!entry) return <div key={rank} />;
        const style = PODIUM[rank];
        const isYou = entry.studentId === currentStudentId;
        const first = rank === 1;

        return (
          <div
            key={entry.studentId}
            className="subject-card"
            style={
              {
                "--card-accent": isYou ? YOU_ACCENT : style.accent,
                "--float-delay": `${-rank * 1.2}s`,
              } as React.CSSProperties
            }
          >
            <div className="subject-card-float">
              <div className="subject-card-face subject-card-face--panel">
                <div
                  className={`subject-card-inner @container flex flex-col items-center px-2 text-center ${
                    first ? "pt-4 pb-5 sm:pt-6 sm:pb-7" : "pt-3 pb-4 sm:pt-4 sm:pb-5"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`relative z-10 leading-none ${first ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
                  >
                    {style.medal}
                  </span>
                  <span className="relative z-10 mt-2">
                    <Avatar
                      image={entry.image}
                      name={entry.name}
                      size={first ? 56 : 44}
                      ring={style.ring}
                    />
                  </span>
                  <p className="text-foreground relative z-10 mt-2 line-clamp-2 w-full text-xs leading-tight font-semibold wrap-break-word sm:text-sm">
                    {entry.name}
                  </p>
                  {isYou && (
                    <span className="bg-accent-primary/15 text-accent-primary relative z-10 mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                      You
                    </span>
                  )}
                  <p
                    className={`gold-text relative z-10 mt-1.5 font-mono font-bold tabular-nums ${
                      first ? "text-xl sm:text-2xl" : "text-base sm:text-xl"
                    }`}
                  >
                    {entry.points.toLocaleString()}
                  </p>
                  <span className="text-gold-soft/60 relative z-10 text-[8px] font-medium tracking-[0.2em] uppercase sm:text-[9px]">
                    Points
                  </span>

                  <span className="subject-card-sheen" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankRow({
  entry,
  index,
  isYou,
}: {
  entry: LeaderboardEntry;
  index: number;
  isYou: boolean;
}) {
  const subtitle = subtitleFor(entry);

  return (
    <div
      className="subject-card subject-card--row"
      style={
        {
          "--card-accent": isYou ? YOU_ACCENT : "#8b7fd9",
          "--float-delay": `${-(index % 5) * 1.1}s`,
        } as React.CSSProperties
      }
    >
      <div className="subject-card-float">
        <div className="subject-card-face subject-card-face--panel">
          <div className="subject-card-inner flex items-center gap-3 p-3 sm:p-3.5">
            <span className="border-gold/30 relative z-10 flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border bg-black/50 px-1.5">
              <span className="gold-text font-mono text-xs font-bold tabular-nums">
                #{entry.rank}
              </span>
            </span>
            <span className="relative z-10">
              <Avatar image={entry.image} name={entry.name} size={36} />
            </span>
            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                <span className="truncate">{entry.name}</span>
                {isYou && (
                  <span className="bg-accent-primary/15 text-accent-primary shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                    You
                  </span>
                )}
              </p>
              {subtitle && <p className="text-text-secondary truncate text-xs">{subtitle}</p>}
            </div>
            <span className="gold-text relative z-10 shrink-0 font-mono text-base font-bold tabular-nums">
              {entry.points.toLocaleString()}
            </span>

            <span className="subject-card-sheen" />
          </div>
        </div>
      </div>
    </div>
  );
}
