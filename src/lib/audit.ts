import type { Prisma } from "@/generated/prisma/client";

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "ARCHIVE",
  "APPROVE",
  "REJECT",
  "ROLE_CHANGED",
  "ACTIVATED",
  "DEACTIVATED",
  "RECONCILED",
  "DISPUTE_RESOLVED",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
  "User",
  "Track",
  "Subject",
  "Paper",
  "Chapter",
  "Topic",
  "ChapterPlaylist",
  "ChapterSpecialVideo",
  "StudentNote",
  "OfficialNote",
  "ExamResult",
  "PointRule",
  "Plan",
  "PaidBatch",
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

type LogAuditParams = {
  actorId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logAudit(
  tx: Prisma.TransactionClient,
  params: LogAuditParams
): Promise<void> {
  await tx.auditLog.create({
    data: {
      adminId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
    },
  });
}
