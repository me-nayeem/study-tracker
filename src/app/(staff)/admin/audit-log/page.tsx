import { Suspense } from "react";
import { requireRole } from "@/lib/dal";
import { searchAuditLog } from "@/lib/audit-data";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  type AuditAction,
  type AuditEntityType,
} from "@/lib/audit";
import { AuditLogFilters } from "@/components/staff/audit/audit-log-filters";
import { AuditLogList } from "@/components/staff/audit/audit-log-list";
import { Pagination } from "@/components/staff/shared/pagination";

function isValidAction(value: string | undefined): value is AuditAction {
  return !!value && (AUDIT_ACTIONS as readonly string[]).includes(value);
}

function isValidEntityType(value: string | undefined): value is AuditEntityType {
  return !!value && (AUDIT_ENTITY_TYPES as readonly string[]).includes(value);
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string; page?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;

  const entityType = isValidEntityType(params.entityType) ? params.entityType : undefined;
  const action = isValidAction(params.action) ? params.action : undefined;
  const page = Number(params.page) || 1;

  const {
    logs,
    page: currentPage,
    totalPages,
  } = await searchAuditLog({ entityType, action, page });

  const filterParams: Record<string, string> = {};
  if (entityType) filterParams.entityType = entityType;
  if (action) filterParams.action = action;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Audit Log</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Every staff mutation, filterable by entity and action.
        </p>
      </div>

      <Suspense
        fallback={<div className="border-bg-elevated bg-bg-surface h-20 rounded-lg border" />}
      >
        <AuditLogFilters />
      </Suspense>

      <AuditLogList logs={logs} />

      <Pagination
        basePath="/admin/audit-log"
        page={currentPage}
        totalPages={totalPages}
        params={filterParams}
      />
    </div>
  );
}
