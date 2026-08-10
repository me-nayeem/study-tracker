import { z } from "zod";
import { EducationLevel, GroupType, Board } from "@/generated/prisma/enums";

const educationLevels = Object.values(EducationLevel) as [EducationLevel, ...EducationLevel[]];
const groupTypes = Object.values(GroupType) as [GroupType, ...GroupType[]];
const boards = Object.values(Board) as [Board, ...Board[]];

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const OnboardingSchema = z.object({
  level: z.enum(educationLevels, { error: "Select a level." }),
  group: z.enum(groupTypes, { error: "Select a group." }),
  board: z.enum(boards).optional(),
  institutionName: z.string().trim().min(1, "Institution name is required.").max(160),
  phoneNumber: z.string().trim().regex(BD_PHONE_REGEX, {
    error: "Enter a valid 11-digit Bangladeshi mobile number, e.g. 01712345678.",
  }),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
