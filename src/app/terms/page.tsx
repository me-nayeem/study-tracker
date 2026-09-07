import Link from "next/link";
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site-config";

export const metadata = {
  title: `Terms of Service — ${SITE_NAME}`,
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <Link href="/" className="text-text-secondary hover:text-foreground text-sm">
          ← Back to home
        </Link>

        <h1 className="font-display text-foreground mt-4 text-3xl">Terms of Service</h1>
        <p className="text-text-secondary mt-2 text-sm">Last updated: {LEGAL_LAST_UPDATED}</p>

        <div className="text-foreground mt-8 space-y-8 text-sm leading-relaxed md:text-base">
          <section>
            <h2 className="font-display mb-2 text-lg">1. Acceptance of terms</h2>
            <p>
              By creating an account or using {SITE_NAME}, you agree to these Terms of Service.
              If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">2. Eligibility</h2>
            <p>
              {SITE_NAME} is designed for HSC/SSC students. If you are under the age required by
              your local law to agree to these terms on your own, a parent or guardian should
              review these terms with you before you use the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">3. Your account</h2>
            <p>
              You can sign in with Google or with a one-time email code. You're responsible for
              keeping access to your email/Google account secure, since that's how your
              {" " + SITE_NAME} account is protected. We may suspend or deactivate accounts that
              violate these terms or show signs of abuse.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">4. Content you upload</h2>
            <p>
              You retain ownership of notes and other content you upload. By uploading content
              and marking it public, you grant {SITE_NAME} a license to store, display, and
              distribute it to other students on the platform. You're responsible for making
              sure content you upload doesn't infringe on anyone else's rights and isn't
              abusive, spam, or otherwise inappropriate. We may remove content or reject it
              during moderation at our discretion.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Upload content you don't have the right to share.</li>
              <li>Attempt to farm points through spam, duplicate, or junk uploads.</li>
              <li>Interfere with or attempt to disrupt the platform's operation.</li>
              <li>Use another person's account or phone number without permission.</li>
              <li>Harass, abuse, or post inappropriate content toward other students.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">6. Points, levels, and leaderboards</h2>
            <p>
              Points, levels, and leaderboard rankings are for engagement and motivation only.
              They have no cash or monetary value, aren't transferable, and may be adjusted,
              recalculated, or reset if we identify abuse or scoring errors.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">7. External exams</h2>
            <p>
              Chapter-wise and topic-wise exam results are provided by third-party exam
              providers and matched to your account using your phone number. While we work to
              display this data accurately, {SITE_NAME} is not responsible for errors,
              omissions, or delays originating from the exam provider. If a result looks
              incorrect, contact us so we can review it.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">8. Subscriptions and payments</h2>
            <p>
              {SITE_NAME} does not currently process payments. If we introduce paid
              subscriptions or paid content batches in the future, additional terms specific to
              billing and refunds will be presented before you're charged anything.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">9. Intellectual property</h2>
            <p>
              The {SITE_NAME} name, design, and platform-authored content (including official
              notes) belong to us or our content partners. Curated third-party content (like
              linked YouTube playlists) remains the property of its original creators; we only
              link to it.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">10. Termination</h2>
            <p>
              You may stop using {SITE_NAME} at any time. We may suspend or terminate accounts
              that violate these terms. You can request account deletion by contacting us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">11. Disclaimer and limitation of liability</h2>
            <p>
              {SITE_NAME} is provided "as is" without warranties of any kind. We don't guarantee
              the platform will be uninterrupted, error-free, or that quiz/exam outcomes will
              reflect your actual exam performance. To the fullest extent permitted by law, we
              aren't liable for indirect or consequential damages arising from your use of the
              platform.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">12. Governing law</h2>
            <p>These terms are governed by the laws of Bangladesh.</p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">13. Changes to these terms</h2>
            <p>
              We may update these terms as {SITE_NAME} evolves. We'll update the "Last updated"
              date above when we do. Continued use after changes means you accept the revised
              terms.
            </p>
          </section>

          <section>
            <h2 className="font-display mb-2 text-lg">14. Contact us</h2>
            <p>
              Questions about these terms? Email{" "}
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