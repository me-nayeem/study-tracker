import type { Metadata } from "next";
import { LoginForm } from "../../../components/auth/login-form";
import { MasteryConstellation } from "../../../components/auth/mastery-constellation";
import { BrandLogo } from "@/components/shared/brand-logo";
import { safeCallbackPath } from "@/lib/login-redirect";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // where to send the user after signing in (only same-site paths)
  const { callbackUrl } = await searchParams;
  const next = safeCallbackPath(callbackUrl);

  return (
    <div className="flex min-h-screen">
      <div className="bg-bg-surface relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <BrandLogo className="relative" />

        <div className="absolute inset-0 flex items-center justify-center opacity-80">
          <div className="h-full max-h-[420px] w-full max-w-[520px]">
            <MasteryConstellation />
          </div>
        </div>

        <h2 className="font-display text-foreground relative text-4xl leading-tight">
          Every chapter,
          <br />
          one weak spot at a time.
        </h2>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-16 lg:w-1/2">
        <div className="mb-8 text-center lg:hidden">
          <BrandLogo />
        </div>
        <LoginForm callbackUrl={next} />
      </div>
    </div>
  );
}
