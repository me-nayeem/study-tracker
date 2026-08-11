import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroCarousel } from "@/components/marketing/hero-carousel";
import { FeatureMarquee } from "@/components/marketing/feature-marquee";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ExamBreakdownSection } from "@/components/marketing/exam-breakdown-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { GamificationPreview } from "@/components/marketing/gamification-preview";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "MANAGER") redirect("/manager");
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      <HeroCarousel slides={HERO_SLIDES} />
      <FeatureMarquee />
      <HowItWorks />
      <ExamBreakdownSection />
      <FeatureGrid />
      <GamificationPreview />
      <PlanComparison />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}
