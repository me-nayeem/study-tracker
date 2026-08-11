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

export function MasteryBadge({ status }: { status: MasteryStatus }) {
  return (
    <span className={`font-mono text-xs font-medium ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
