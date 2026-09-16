import { z } from "zod";
import { EducationLevel, GroupType } from "@/generated/prisma/enums";

const educationLevels = Object.values(EducationLevel) as [EducationLevel, ...EducationLevel[]];
const groupTypes = Object.values(GroupType) as [GroupType, ...GroupType[]];

const id = z.string().min(1, "Missing id.");

export const TrackSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  level: z.enum(educationLevels, { error: "Select a level." }),
  group: z.enum(groupTypes, { error: "Select a group." }),
  batchYear: z.coerce.number().int().min(2000).max(2100),
  examDate: z.coerce.date().optional(),
});
export const TrackUpdateSchema = TrackSchema.extend({ id });

export const SubjectSchema = z.object({
  trackId: id,
  name: z.string().trim().min(1, "Name is required.").max(80),
  order: z.coerce.number().int().min(0).default(0),
});
export const SubjectUpdateSchema = SubjectSchema.extend({ id });

export const PaperSchema = z.object({
  subjectId: id,
  name: z.string().trim().min(1, "Name is required.").max(40),
  order: z.coerce.number().int().min(0).default(0),
});
export const PaperUpdateSchema = PaperSchema.extend({ id });

export const ChapterSchema = z.object({
  paperId: id,
  name: z.string().trim().min(1, "Name is required.").max(160),
  order: z.coerce.number().int().min(0).default(0),
  examWeight: z.coerce.number().min(0.1, "Weight must be at least 0.1.").max(100),
  masteryPassPercent: z.coerce.number().int().min(0).max(100),
  isFreePreview: z.coerce.boolean().default(false),
});
export const ChapterUpdateSchema = ChapterSchema.extend({ id });

export const TopicSchema = z.object({
  chapterId: id,
  name: z.string().trim().min(1, "Name is required.").max(160),
  order: z.coerce.number().int().min(0).default(0),
   examHtmlFileName: z.preprocess(
    (val) => (typeof val === "string" ? val.trim().replace(/^\/+/, "") : val),
    z
      .string()
      .regex(
        /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\.html$/,
        "Must be a relative path like chapter1/topic3.html \u2014 letters, numbers, underscores, and hyphens only, no leading slash needed"
      )
      .optional()
      .or(z.literal("").transform(() => undefined))
  ),
});
export const TopicUpdateSchema = TopicSchema.extend({ id });

export const ArchiveSchema = z.object({ id });
export const TopicDeleteSchema = z.object({ id });