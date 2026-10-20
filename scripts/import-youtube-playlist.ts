/**
 * Import a YouTube playlist (or a single video) into a chapter.
 *
 * Creates the ChapterPlaylist row if the chapter doesn't already have one with the same title,
 * then appends every video that isn't already stored (safe to re-run).
 *
 * Usage:
 *   npx tsx scripts/import-youtube-playlist.ts --chapter <chapterId> --url <playlist|video url>
 *     [--teacher "Rakib Vaiya"]   name shown in the title; auto-detected for channels already in the DB
 *     [--kind full|oneshot]       default: playlist url → full, single video → oneshot
 *     [--title "..."]            exact playlist title (overrides the generated one)
 *     [--exclude id1,id2]         leave out specific video ids (e.g. promo videos)
 *     [--only id1,id2]            keep only these video ids from the playlist
 *     [--reverse]                 reverse the playlist order (newest-first playlists)
 *     [--sort-number]             order by the class/lecture number in each title
 *     [--dry-run]                 show what would happen without writing anything
 *
 * Titles follow the existing convention:
 *   "Full Chapter Playlist (<teacher>)" / "OneShot (<teacher>)"
 *
 * Needs YOUTUBE_API_KEY and DIRECT_URL (or DATABASE_URL) in .env.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const TITLE_MAX_LEN = 160; // @db.VarChar(160)
const YT_API = "https://www.googleapis.com/youtube/v3";

type Video = { id: string; title: string };

function parseArgs(argv: string[]) {
  const args: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key.slice(2)] = true;
    } else {
      args[key.slice(2)] = next;
      i++;
    }
  }
  return args;
}

function playlistIdFrom(url: string): string | null {
  const match = url.match(/[?&]list=([\w-]+)/);
  return match ? match[1] : null;
}

function videoIdFrom(url: string): string | null {
  const short = url.match(/youtu\.be\/([\w-]{6,})/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([\w-]{6,})/);
  if (watch) return watch[1];
  const shorts = url.match(/youtube\.com\/(?:shorts|live|embed)\/([\w-]{6,})/);
  if (shorts) return shorts[1];
  return /^[\w-]{11}$/.test(url) ? url : null;
}

async function yt<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.YOUTUBE_API_KEY;
  const qs = new URLSearchParams({ ...params, key: key! });
  const res = await fetch(`${YT_API}/${path}?${qs}`);
  if (!res.ok) {
    throw new Error(`YouTube API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type Snippet = { title: string; channelId: string; resourceId?: { videoId: string } };

async function fetchPlaylist(playlistId: string): Promise<{ channelId: string; videos: Video[] }> {
  const meta = await yt<{ items: { snippet: Snippet }[] }>("playlists", {
    part: "snippet",
    id: playlistId,
  });
  if (!meta.items.length) throw new Error(`Playlist ${playlistId} not found (private or deleted?)`);

  const videos: Video[] = [];
  let pageToken: string | undefined;
  do {
    const page = await yt<{ items: { snippet: Snippet }[]; nextPageToken?: string }>(
      "playlistItems",
      { part: "snippet", playlistId, maxResults: "50", ...(pageToken ? { pageToken } : {}) }
    );
    for (const { snippet } of page.items) {
      if (snippet.title === "Deleted video" || snippet.title === "Private video") continue;
      if (snippet.resourceId?.videoId) {
        videos.push({ id: snippet.resourceId.videoId, title: snippet.title });
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  return { channelId: meta.items[0].snippet.channelId, videos };
}

async function fetchVideo(videoId: string): Promise<{ channelId: string; videos: Video[] }> {
  const res = await yt<{ items: { snippet: Snippet }[] }>("videos", {
    part: "snippet",
    id: videoId,
  });
  if (!res.items.length) throw new Error(`Video ${videoId} not found (private or deleted?)`);
  const { snippet } = res.items[0];
  return { channelId: snippet.channelId, videos: [{ id: videoId, title: snippet.title }] };
}

async function channelUrlFor(channelId: string): Promise<string> {
  const res = await yt<{ items: { snippet: { customUrl?: string } }[] }>("channels", {
    part: "snippet",
    id: channelId,
  });
  const handle = res.items[0]?.snippet.customUrl;
  return handle
    ? `https://www.youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}`
    : `https://www.youtube.com/channel/${channelId}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const chapterId = typeof args.chapter === "string" ? args.chapter : null;
  const url = typeof args.url === "string" ? args.url.trim() : null;
  const dryRun = args["dry-run"] === true;

  if (!chapterId || !url) {
    console.error(
      "Usage: --chapter <chapterId> --url <playlist|video url> [--teacher name] [--kind full|oneshot] [--dry-run]"
    );
    process.exit(1);
  }
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("Missing YOUTUBE_API_KEY in .env");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    }),
  });

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        name: true,
        paper: { select: { name: true, subject: { select: { name: true } } } },
      },
    });
    if (!chapter) throw new Error(`Chapter ${chapterId} not found`);
    console.log(`Chapter: ${chapter.paper.subject.name} · ${chapter.paper.name} · ${chapter.name}`);

    // 1. fetch from YouTube
    const playlistId = playlistIdFrom(url);
    const videoId = playlistId ? null : videoIdFrom(url);
    if (!playlistId && !videoId)
      throw new Error(`Couldn't read a playlist or video id from ${url}`);
    const { channelId, videos: fetched } = playlistId
      ? await fetchPlaylist(playlistId)
      : await fetchVideo(videoId!);
    // a playlist can list the same video twice — keep the first
    const seen = new Set<string>();
    let videos = fetched.filter((v) => !seen.has(v.id) && seen.add(v.id));
    if (videos.length < fetched.length) {
      console.log(`Skipping ${fetched.length - videos.length} duplicate entr(ies) in the playlist`);
    }

    // --exclude id1,id2 : leave out specific videos (e.g. promos inside a playlist)
    // --only id1,id2 : keep just these videos, in the order given
    // (e.g. the named teacher's videos from a mixed playlist, or a hand-fixed order)
    if (typeof args.only === "string") {
      const byId = new Map(videos.map((v) => [v.id, v]));
      videos = args.only
        .split(",")
        .map((s) => byId.get(s.trim()))
        .filter((v): v is Video => Boolean(v));
      console.log(`Keeping only ${videos.length} selected video(s)`);
    }

    // --reverse : playlists published newest-first
    if (args.reverse === true) videos = videos.reverse();

    if (typeof args.exclude === "string") {
      const excluded = new Set(args.exclude.split(",").map((s) => s.trim()));
      const before = videos.length;
      videos = videos.filter((v) => !excluded.has(v.id));
      console.log(`Excluding ${before - videos.length} video(s) by id`);
    }

    // --sort-number : order by the lecture/class number in the title ("Class 6.1", "Lec-07");
    // titles without a number keep their relative order at the end
    if (args["sort-number"] === true) {
      const numberIn = (rawTitle: string) => {
        // Bengali digits → ASCII so "১২." and "12." sort the same
        const title = rawTitle.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
        const m =
          title.match(/(?:class|lec(?:ture)?|লেকচার|পর্ব|ক্লাস)\s*[-–:.]?\s*(\d+(?:\.\d+)?)/i) ??
          title.match(/^\s*(\d{1,3})\s*[.।|)]/); // "০৭. প্রোটন পাম্প …", "১| টিস্যু …"
        if (m) return parseFloat(m[1]);
        // an orientation/intro class goes before lecture 1
        return /orientation|ওরিয়েন্টেশন/i.test(title) ? 0 : Number.POSITIVE_INFINITY;
      };
      videos = videos
        .map((v, i) => ({ v, i, n: numberIn(v.title) }))
        .sort((a, b) => a.n - b.n || a.i - b.i)
        .map((x) => x.v);
    }
    const channelUrl = await channelUrlFor(channelId);
    console.log(`YouTube: ${videos.length} video(s) from ${channelUrl}`);

    // 2. teacher name: explicit, or reuse the name already used for this channel
    let teacher = typeof args.teacher === "string" ? args.teacher.trim() : "";
    if (!teacher) {
      const known = await prisma.chapterPlaylist.findFirst({
        // YouTube returns handles lower-cased; stored URLs may not be
        where: {
          channelUrl: { equals: channelUrl, mode: "insensitive" },
          title: { contains: "(" },
        },
        orderBy: { createdAt: "desc" },
        select: { title: true },
      });
      teacher = known?.title.match(/\(([^)]+)\)\s*$/)?.[1].trim() ?? "";
    }
    if (!teacher && typeof args.title !== "string") {
      throw new Error(`New channel ${channelUrl} — pass --teacher "Name" for the playlist title`);
    }

    const kind =
      args.kind === "oneshot" || args.kind === "full" ? args.kind : playlistId ? "full" : "oneshot";
    const title = (
      typeof args.title === "string"
        ? args.title.trim()
        : `${kind === "full" ? "Full Chapter Playlist" : "OneShot"} (${teacher})`
    ).slice(0, TITLE_MAX_LEN);

    // 3. find or create the playlist row, then append missing videos
    const existing = await prisma.chapterPlaylist.findFirst({
      where: { chapterId, title, isArchived: false },
      include: { videos: { select: { youtubeUrl: true, order: true } } },
    });

    const storedIds = new Set(
      (existing?.videos ?? []).map((v) => videoIdFrom(v.youtubeUrl)).filter(Boolean)
    );
    const newVideos = videos.filter((v) => !storedIds.has(v.id));
    let nextVideoOrder =
      existing && existing.videos.length ? Math.max(...existing.videos.map((v) => v.order)) + 1 : 0;

    console.log(
      `${existing ? "Using existing" : "Creating"} playlist "${title}" · ${newVideos.length} new, ${
        videos.length - newVideos.length
      } already stored`
    );

    if (dryRun) {
      for (const v of newVideos) console.log(`  + ${v.title}`);
      console.log("Dry run — nothing written.");
      return;
    }
    if (existing && newVideos.length === 0) {
      console.log("Nothing new to insert.");
      return;
    }

    await prisma.$transaction(async (tx) => {
      let playlistRowId = existing?.id;
      if (!playlistRowId) {
        const last = await tx.chapterPlaylist.findFirst({
          where: { chapterId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        const created = await tx.chapterPlaylist.create({
          data: {
            chapterId,
            title,
            youtubeUrl: channelUrl,
            channelUrl,
            order: (last?.order ?? 0) + 1,
          },
        });
        playlistRowId = created.id;
      }

      await tx.chapterPlaylistVideo.createMany({
        data: newVideos.map((v) => ({
          playlistId: playlistRowId!,
          title: v.title.slice(0, TITLE_MAX_LEN),
          youtubeUrl: `https://youtu.be/${v.id}`,
          order: nextVideoOrder++,
        })),
      });
    });

    console.log(`Done: "${title}" now has ${storedIds.size + newVideos.length} video(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
