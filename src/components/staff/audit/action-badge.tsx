const ACTION_COLOR: Record<string, string> = {
  CREATE: "text-state-success",
  APPROVE: "text-state-success",
  ACTIVATED: "text-state-success",
  RECONCILED: "text-state-success",
  UPDATE: "text-accent-gamify",
  ARCHIVE: "text-accent-gamify",
  ROLE_CHANGED: "text-accent-gamify",
  DELETE: "text-state-warning",
  REJECT: "text-state-warning",
  DEACTIVATED: "text-state-warning",
  DISPUTE_RESOLVED: "text-state-warning",
};

export function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLOR[action] ?? "text-text-secondary";
  return <span className={`font-mono text-xs font-medium ${color}`}>{action}</span>;
}
