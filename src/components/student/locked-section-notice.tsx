import { Lock } from "lucide-react";

export function LockedSectionNotice({ label }: { label: string }) {
  return (
    <div className="card-surface p-8 text-center">
      <span className="bg-gold/10 text-gold mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <Lock className="h-5 w-5" />
      </span>
      <p className="font-display text-foreground mt-3 text-lg">{label} for this chapter is Pro</p>
      <p className="text-text-secondary mx-auto mt-1 max-w-sm text-sm">
        This chapter isn&apos;t in your free preview. Ask about Pro access to unlock it.
      </p>
    </div>
  );
}
