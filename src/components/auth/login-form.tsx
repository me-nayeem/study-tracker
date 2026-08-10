"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { requestOtp, type RequestOtpState } from "@/actions/auth";

const initialRequestState: RequestOtpState = { success: false, message: "" };
const CODE_LENGTH = 6;

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, startVerifying] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);
  const resendFormRef = useRef<HTMLFormElement>(null);

  const [requestState, requestAction, isRequesting] = useActionState(
    async (prevState: RequestOtpState, formData: FormData) => {
      const result = await requestOtp(prevState, formData);
      if (result.success) {
        setStep("code");
        setCode(Array(CODE_LENGTH).fill(""));
        requestAnimationFrame(() => digitRefs.current[0]?.focus());
      }
      return result;
    },
    initialRequestState
  );

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setCode(next);
    digitRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError("");
    const fullCode = code.join("");
    if (fullCode.length !== CODE_LENGTH) {
      setVerifyError("Enter all 6 digits.");
      return;
    }

    startVerifying(async () => {
      const result = await signIn("credentials", {
        email,
        code: fullCode,
        redirect: false,
      });

      if (!result || result.error) {
        setVerifyError("That code didn't work. Check it or request a new one.");
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="animate-card-in w-full max-w-sm">
      <h1 className="font-display text-foreground text-3xl">
        {step === "email" ? "Sign in" : "Check your email"}
      </h1>
      <p className="text-text-secondary mt-2 text-sm">
        {step === "email"
          ? "Enter your email and we'll send a 6-digit code."
          : `We sent a code to ${email}.`}
      </p>

      {step === "email" ? (
        <form action={requestAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-text-text-secondary text-sm">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-bg-elevated bg-bg-surface text-foreground focus-visible:border-accent-primary mt-1.5 w-full rounded-lg border px-4 py-2.5 transition-colors outline-none"
            />
          </div>

          {requestState.message && (
            <p
              role="status"
              className={
                requestState.success ? "text-state-success text-sm" : "text-state-warning text-sm"
              }
            >
              {requestState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isRequesting}
            className="bg-accent-primary text-foreground w-full rounded-lg py-2.5 font-medium transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isRequesting ? "Sending..." : "Send code"}
          </button>

          <Divider />

          <GoogleButton onClick={handleGoogleSignIn} loading={isGoogleLoading} />
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  digitRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                className="border-bg-elevated bg-bg-surface text-foreground focus-visible:border-accent-primary h-12 w-11 rounded-lg border text-center font-mono text-lg transition-all outline-none focus-visible:shadow-[0_0_0_3px_rgba(217,113,75,0.25)]"
              />
            ))}
          </div>

          {verifyError && (
            <p role="alert" className="text-state-warning text-sm">
              {verifyError}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="bg-accent-primary text-foreground w-full rounded-lg py-2.5 font-medium transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isVerifying ? "Verifying..." : "Verify & continue"}
          </button>

          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-text-secondary underline-offset-4 hover:underline"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={() => resendFormRef.current?.requestSubmit()}
              className="text-accent-primary underline-offset-4 hover:underline"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      <form ref={resendFormRef} action={requestAction} className="hidden">
        <input type="hidden" name="email" value={email} />
      </form>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="bg-bg-elevated h-px flex-1" />
      <span className="text-text-secondary text-xs">or</span>
      <div className="bg-bg-elevated h-px flex-1" />
    </div>
  );
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="border-bg-elevated bg-bg-surface text-foreground hover:bg-bg-elevated flex w-full items-center justify-center gap-3 rounded-lg border py-2.5 font-medium transition-colors disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
        />
      </svg>
      {loading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
