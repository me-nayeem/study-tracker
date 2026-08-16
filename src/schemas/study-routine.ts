import { z } from "zod";

const id = z.string().min(1, "Missing id.");

const timeToMinutes = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Enter a valid time.")
  .transform((val) => {
    const [h, m] = val.split(":").map(Number);
    return h * 60 + m;
  });

export const StudyRoutineSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
});
export const StudyRoutineUpdateSchema = StudyRoutineSchema.extend({ id });

const routineItemBase = z.object({
  dayOfWeek: z.coerce.number().int().min(0, "Select a day.").max(6, "Select a day."),
  startMinute: timeToMinutes,
  endMinute: timeToMinutes,
  subjectId: z.string().trim().min(1).optional(),
  label: z.string().trim().max(160).optional(),
});

export const StudyRoutineItemSchema = routineItemBase
  .extend({ routineId: id })
  .refine((data) => data.endMinute > data.startMinute, {
    message: "End time must be after start time.",
    path: ["endMinute"],
  });

export const StudyRoutineItemUpdateSchema = routineItemBase
  .extend({ id })
  .refine((data) => data.endMinute > data.startMinute, {
    message: "End time must be after start time.",
    path: ["endMinute"],
  });

export const RoutineIdSchema = z.object({ id });
export const RoutineItemIdSchema = z.object({ id });
