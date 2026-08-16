import { z } from "zod";
import { SpecialVideoTag } from "@/generated/prisma/enums";
import { AccessType } from "@/generated/prisma/enums";

const id = z.string().min(1, "Missing id.");

const accessTypes = Object.values(AccessType) as [AccessType, ...AccessType[]];
const specialVideoTags = Object.values(SpecialVideoTag) as [SpecialVideoTag, ...SpecialVideoTag[]];

const youtubeUrl = z
  .string()
  .trim()
  .max(255)
  .url({ error: "Enter a valid URL." })
  .refine(
    (url) => {
      try {
        const hostname = new URL(url).hostname.toLowerCase();
        return (
          hostname === "youtube.com" ||
          hostname === "www.youtube.com" ||
          hostname === "m.youtube.com" ||
          hostname === "youtu.be"
        );
      } catch {
        return false;
      }
    },
    { error: "Enter a valid YouTube URL." }
  );

export const PlaylistReviewSchema = z.object({
  playlistId: id,
  rating: z.coerce.number().int().min(1, "Rating is required.").max(5),
  comment: z.string().trim().max(1000, "Keep it under 1000 characters.").optional(),
});

export const ChapterSpecialVideoSchema = z.object({
  chapterId: id,
  tag: z.enum(specialVideoTags, { error: "Select a tag." }),
  title: z.string().trim().min(1, "Title is required.").max(160),
  url: z.string().trim().max(255).url({ error: "Enter a valid URL." }),
  order: z.coerce.number().int().min(0).default(0),
});

export const OfficialNoteSchema = z.object({
  chapterId: id,
  title: z.string().trim().min(1, "Title is required.").max(160),
  fileUrl: z.string().trim().max(255).url({ error: "Enter a valid URL." }),
  accessType: z.enum(accessTypes, { error: "Select an access type." }),
  order: z.coerce.number().int().min(0).default(0),
});

export const TipCategory = ["LAW", "SHORTCUT", "CALCULATOR_HACK"] as const;

export const ChapterTipSchema = z
  .object({
    chapterId: id,
    category: z.enum(TipCategory, { error: "Select a category." }),
    title: z.string().trim().min(1, "Title is required.").max(160),
    youtubeUrl: youtubeUrl.optional().or(z.literal("")),
    driveLink: z
      .string()
      .trim()
      .max(255)
      .url({ error: "Enter a valid URL." })
      .optional()
      .or(z.literal("")),
    order: z.coerce.number().int().min(0).default(0),
  })
  .refine((d) => d.category !== "LAW" || !!d.driveLink, {
    message: "Drive link is required for a Law.",
    path: ["driveLink"],
  })
  .refine((d) => d.category !== "CALCULATOR_HACK" || !!d.youtubeUrl, {
    message: "YouTube link is required for a Calculator Hack.",
    path: ["youtubeUrl"],
  })
  .refine((d) => d.category !== "SHORTCUT" || !!d.youtubeUrl, {
    message: "Shortcut requires a YouTube link.",
    path: ["youtubeUrl"],
  });

export const ChapterTipUpdateSchema = ChapterTipSchema;

export const OfficialNoteUpdateSchema = OfficialNoteSchema.extend({ id });

export const ChapterSpecialVideoUpdateSchema = ChapterSpecialVideoSchema.extend({ id });

export const ArchiveContentSchema = z.object({ id });

export const ChapterPlaylistSchema = z.object({
  chapterId: id,
  title: z.string().trim().min(1, "Title is required.").max(160),
  youtubeUrl,
  channelUrl: z
    .string()
    .trim()
    .max(255)
    .url({ error: "Enter a valid URL." })
    .optional()
    .or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
});
export const ChapterPlaylistUpdateSchema = ChapterPlaylistSchema.extend({ id });

export const ChapterPlaylistVideoSchema = z.object({
  playlistId: id,
  title: z.string().trim().min(1, "Title is required.").max(160),
  youtubeUrl,
  order: z.coerce.number().int().min(0).default(0),
});
export const ChapterPlaylistVideoUpdateSchema = ChapterPlaylistVideoSchema.extend({ id });
