import type { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, otpVerifyLimiter } from "@/lib/rate-limit";
import { VerifyOtpSchema } from "@/schemas/auth";

const MAX_OTP_ATTEMPTS = 5;

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = VerifyOtpSchema.safeParse({
          email: credentials?.email,
          code: credentials?.code,
        });
        if (!parsed.success) return null;

        const { email, code } = parsed.data;

        const { success: withinLimit } = await checkRateLimit(otpVerifyLimiter, email);
        if (!withinLimit) return null;

        const otp = await prisma.emailOtp.findFirst({
          where: { email, purpose: "EMAIL_VERIFICATION" },
          orderBy: { createdAt: "desc" },
        });

        if (!otp) return null;
        if (otp.consumedAt) return null;
        if (otp.expiresAt < new Date()) return null;
        if (otp.attempts >= MAX_OTP_ATTEMPTS) return null;

        const isValid = await compare(code, otp.codeHash);

        if (!isValid) {
          await prisma.emailOtp.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          });
          return null;
        }

        await prisma.emailOtp.update({
          where: { id: otp.id },
          data: { consumedAt: new Date() },
        });

        const user = await prisma.user.upsert({
          where: { email },
          create: { email, emailVerified: new Date(), role: "STUDENT" },
          update: { emailVerified: new Date() },
        });

        if (!user.isActive) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
