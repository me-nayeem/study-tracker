import { z } from "zod";

const id = z.string().min(1, "Missing id.");

export const GrantManualProSchema = z.object({
  userId: id,
  days: z.coerce.number().int().min(1, "Must be at least 1 day.").max(3650),
  paymentReference: z.string().trim().max(160).optional(),
});

export const RevokeManualProSchema = z.object({
  userId: id,
});