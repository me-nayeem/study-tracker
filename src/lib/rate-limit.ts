import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — rate limiting cannot function without these."
  );
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


export const otpRequestLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "ratelimit:otp-request",
  analytics: true,
});


export const otpVerifyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  prefix: "ratelimit:otp-verify",
  analytics: true,
});

export type RateLimitResult = {
  success: boolean;
  retryAfterSeconds: number;
};


export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  const { success, reset } = await limiter.limit(identifier);

  if (success) {
    return { success: true, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return { success: false, retryAfterSeconds };
}