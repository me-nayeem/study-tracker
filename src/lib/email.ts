import "server-only";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY.");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
