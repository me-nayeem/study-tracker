"use server";

import { randomInt } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { checkRateLimit, otpRequestLimiter } from "@/lib/rate-limit";
import { RequestOtpSchema } from "@/schemas/auth";

const OTP_TTL_MINUTES = 10;
const BCRYPT_ROUNDS = 10;

export type RequestOtpState = {
  success: boolean;
  message: string;
};

export async function requestOtp(
  _prevState: RequestOtpState | undefined,
  formData: FormData
): Promise<RequestOtpState> {
  const parsed = RequestOtpSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

  const { success: withinLimit, retryAfterSeconds } = await checkRateLimit(
    otpRequestLimiter,
    email
  );

  if (!withinLimit) {
    return {
      success: false,
      message: `Too many requests. Try again in ${retryAfterSeconds}s.`,
    };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = await hash(code, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.emailOtp.updateMany({
      where: {
        email,
        purpose: "EMAIL_VERIFICATION",
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    }),
    prisma.emailOtp.create({
      data: {
        email,
        codeHash,
        purpose: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      },
    }),
  ]);

  await sendOtpEmail(email, code);

  return { success: true, message: "Check your email for the code." };
}