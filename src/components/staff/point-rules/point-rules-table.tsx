import { PointRuleRow } from "./point-rule-row";
import type { PointRuleListItem } from "@/lib/point-rules-data";

export function PointRulesTable({ rules }: { rules: PointRuleListItem[] }) {
  return (
    <div className="border-bg-elevated bg-bg-surface overflow-hidden rounded-xl border">
      {rules.map((rule) => (
        <PointRuleRow key={rule.id} rule={rule} />
      ))}
    </div>
  );
}
