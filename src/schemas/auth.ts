import * as z from "zod";

export const RequestOtpSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
});

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  code: z
    .string()
    .trim()
    .length(6, { error: "Code must be exactly 6 digits." })
    .regex(/^\d{6}$/, { error: "Code must contain only numbers." }),
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
