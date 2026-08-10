import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditAction, AuditEntityType } from "@/lib/audit";

export type AuditLogListItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: Date;
  admin: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

const PAGE_SIZE = 25;

export async function searchAuditLog({
  entityType,
  action,
  page,
}: {
  entityType?: AuditEntityType;
  action?: AuditAction;
  page: number;
}) {
  const where = {
    ...(entityType ? { entityType } : {}),
    ...(action ? { action } : {}),
  };

  const safePage = Math.max(1, page);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
