import { requireRole } from "@/lib/dal";
import { getPointRules } from "@/lib/point-rules-data";
import { PointRulesTable } from "@/components/staff/point-rules/point-rules-table";

export default async function PointRulesPage() {
  await requireRole(["ADMIN"]);
  const rules = await getPointRules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Point rules</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Configure how points are awarded. Manual adjustments bypass these rules entirely.
        </p>
      </div>
      <PointRulesTable rules={rules} />
    </div>
  );
}
