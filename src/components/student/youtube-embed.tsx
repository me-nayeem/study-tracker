export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}

export function isYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}

export function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  return (
    <div className="bg-bg-elevated aspect-video overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
