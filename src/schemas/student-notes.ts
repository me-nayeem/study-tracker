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

export const NoteInteractionSchema = z.object({ id });

export const RateNoteSchema = z.object({
  id,
  rating: z.coerce.number().int().min(1, "Rating is required.").max(5),
});

export const CommentOnNoteSchema = z.object({
  noteId: id,
  body: z
    .string()
    .trim()
    .min(1, "Comment can't be empty.")
    .max(500, "Keep it under 500 characters."),
});

export const UpdateNoteCommentSchema = z.object({
  id,
  body: z
    .string()
    .trim()
    .min(1, "Comment can't be empty.")
    .max(500, "Keep it under 500 characters."),
});

export const DeleteNoteCommentSchema = z.object({ id });
