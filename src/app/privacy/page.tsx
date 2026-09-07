import Link from "next/link";
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site-config";

export const metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <Link href="/" className="text-text-secondary hover:text-foreground text-sm">
          ← Back to home
        </Link>

        <h1 className="font-display text-foreground mt-4 text-3xl">Privacy Policy</h1>
        <p className="text-text-secondary mt-2 text-sm">Last updated: {LEGAL_LAST_UPDATED}</p>

        <div className="text-foreground mt-8 space-y-8 text-sm leading-relaxed md:text-base">
          <section>
            <h2 className="font-display mb-2 text-lg">1. Who we are</h2>
            <p>
              {SITE_NAME} ("we", "us", "our") is a study platform for HSC/SSC students in
              Bangladesh, offering chapter-wise progress tracking, curated content, quizzes,
              note sharing, and exam result analysis. This policy explains what information we
              collect, why, and how you can control it.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">2. Information we collect</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <span className="text-foreground font-medium">Account information</span> — name,
                email address, and profile image, whether you sign in with Google or with an
                email one-time code.
              </li>
              <li>
                <span className="text-foreground font-medium">Profile information</span> — your
                education level, group, batch, institution name, exam board, and phone number.
                Phone number is used specifically to match you to your results in third-party
                exams you take.
              </li>
              <li>
                <span className="text-foreground font-medium">Content you provide</span> — notes
                you upload, playlist reviews, comments, ratings, and feedback you submit.
              </li>
              <li>
                <span className="text-foreground font-medium">Activity data</span> — chapter
                progress, quiz attempts and scores, study session durations, points earned, and
                routine/to-do items you create.
              </li>
              <li>
                <span className="text-foreground font-medium">Technical data</span> — basic
                request metadata (e.g. for rate-limiting abuse prevention) and cookies required
                to keep you signed in.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">3. How we use this information</h2>
            <p>We use your information to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Operate your account, track your chapter and topic progress, and show you your dashboard.</li>
              <li>Score quizzes, calculate points, and maintain leaderboards.</li>
              <li>Match your phone number to results from external exam providers so we can show you a performance breakdown.</li>
              <li>Let you upload notes and, if you choose to make them public, show them to other students.</li>
              <li>Send account-related emails (e.g. one-time login codes).</li>
              <li>Detect and prevent abuse (e.g. rate-limiting repeated login attempts).</li>
            </ul>
            <p className="mt-2">We do not sell your personal information, and we do not use it for advertising.</p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">4. Who we share information with</h2>
            <p>We share limited data with the service providers that help us run {SITE_NAME}:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li><span className="text-foreground font-medium">Google</span> — if you sign in with Google.</li>
              <li><span className="text-foreground font-medium">Resend</span> — to deliver login and notification emails.</li>
              <li><span className="text-foreground font-medium">Cloudflare R2</span> — to securely store notes and files you upload.</li>
              <li><span className="text-foreground font-medium">Upstash</span> — for infrastructure-level rate limiting.</li>
              <li><span className="text-foreground font-medium">External exam providers</span> — your phone number is shared solely to match you with your exam results.</li>
            </ul>
            <p className="mt-2">
              These providers process data on our behalf and are not permitted to use it for
              their own purposes. If we introduce paid subscriptions in the future, a payment
              processor will be added here before that feature launches.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">5. Data retention</h2>
            <p>
              We retain your account and activity data for as long as your account is active.
              If you'd like your account and associated data deleted, contact us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              and we will process your request within a reasonable time.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">6. Children's privacy</h2>
            <p>
              {SITE_NAME} is built for HSC/SSC students, many of whom are minors. We collect
              only the information described above and needed to provide the service. If you
              are a parent or guardian and have concerns about your child's information, please
              contact us at the address above.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">7. Your rights and choices</h2>
            <p>
              You can review and update most of your profile information from your account
              settings. You may request access to, correction of, or deletion of your personal
              data at any time by emailing{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">8. Security</h2>
            <p>
              We use industry-standard practices to protect your data, including secure,
              time-limited upload/download links for files and encrypted connections between
              your browser and our servers. No system is completely secure, and we encourage you
              to use a strong, unique password or sign in with Google.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">9. Changes to this policy</h2>
            <p>
              We may update this policy as {SITE_NAME} evolves. We'll update the "Last updated"
              date above when we do. Continued use of {SITE_NAME} after changes means you accept
              the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">10. Contact us</h2>
            <p>
              Questions about this policy or your data? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}