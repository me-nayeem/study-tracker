import type { MasteryStatus } from "@/generated/prisma/enums";

const STATUS_LABEL: Record<MasteryStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  AWAITING_QUIZ: "Awaiting quiz",
  MASTERED: "Mastered",
  NEEDS_REVIEW: "Needs review",
};

const STATUS_COLOR: Record<MasteryStatus, string> = {
  NOT_STARTED: "text-text-secondary",
  IN_PROGRESS: "text-accent-primary",
  AWAITING_QUIZ: "text-accent-gamify",
  MASTERED: "text-state-success",
  NEEDS_REVIEW: "text-state-warning",
};

const STATUS_PILL: Record<MasteryStatus, string> = {
  NOT_STARTED: "border-white/10 bg-white/5 text-text-secondary",
  IN_PROGRESS: "border-accent-primary/30 bg-accent-primary/10 text-accent-primary",
  AWAITING_QUIZ: "border-accent-gamify/30 bg-accent-gamify/10 text-accent-gamify",
  MASTERED: "border-state-success/30 bg-state-success/10 text-state-success",
  NEEDS_REVIEW: "border-state-warning/30 bg-state-warning/10 text-state-warning",
};

export function MasteryBadge({ status }: { status: MasteryStatus }) {
  return (
    <span className={`font-mono text-xs font-medium ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function MasteryPill({
  status,
  size = "md",
}: {
  status: MasteryStatus;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      } ${STATUS_PILL[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
