import Link from "next/link";
import { Sparkles } from "lucide-react";

export function ComingSoon({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-accent-gamify/15 text-accent-gamify mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="font-display text-foreground text-xl">{title}</h1>
      <p className="text-text-secondary mt-1 text-sm">Coming soon.</p>
      <Link href={backHref} className="text-accent-primary mt-4 text-sm hover:underline">
        ← {backLabel}
      </Link>
    </div>
  );
}
