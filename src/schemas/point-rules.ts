import { z } from "zod";

const id = z.string().min(1, "Missing id.");

export const PointRuleUpdateSchema = z.object({
  id,
  value: z.coerce.number().min(0, "Must be 0 or greater."),
  secondaryValue: z.coerce.number().min(0, "Must be 0 or greater.").optional(),
});
