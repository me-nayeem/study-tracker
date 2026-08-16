import { z } from "zod";
import { Board } from "@/generated/prisma/enums";

const boards = Object.values(Board) as [Board, ...Board[]];
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const AccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  board: z.enum(boards).optional(),
  institutionName: z.string().trim().min(1, "Institution name is required.").max(160),
  phoneNumber: z.string().trim().regex(BD_PHONE_REGEX, {
    error: "Enter a valid 11-digit Bangladeshi mobile number, e.g. 01712345678.",
  }),
});

export type AccountInput = z.infer<typeof AccountSchema>;
