export function StaffPlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-10 text-center">
      <h1 className="font-display text-foreground text-xl">{title}</h1>
      <p className="text-text-secondary mt-2 text-sm">{note ?? "Coming in a later step."}</p>
    </div>
  );
}
