import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HSC Study Tracker",
    short_name: "Study Tracker",
    description: "Chapter-wise progress tracking, quizzes, and leaderboards for HSC students.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#17140F",
    theme_color: "#17140F",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
