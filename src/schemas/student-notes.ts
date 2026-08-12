import { z } from "zod";

const id = z.string().min(1, "Missing id.");

const googleDriveUrl = z
  .string()
  .trim()
  .max(255)
  .url({ error: "Enter a valid URL." })
  .refine(
    (url) => {
      try {
        const hostname = new URL(url).hostname.toLowerCase();
        return hostname === "drive.google.com" || hostname === "docs.google.com";
      } catch {
        return false;
      }
    },
    { error: "Enter a valid Google Drive link (drive.google.com or docs.google.com)." }
  );

export const CreateStudentNoteSchema = z.object({
  chapterId: id,
  title: z.string().trim().min(1, "Title is required.").max(160),
  fileUrl: googleDriveUrl,
});

export const UpdateStudentNoteSchema = z.object({
  id,
  title: z.string().trim().min(1, "Title is required.").max(160),
  fileUrl: googleDriveUrl,
});

export const SetStudentNoteVisibilitySchema = z.object({ id });
