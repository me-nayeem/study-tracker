import "server-only";
import { prisma } from "@/lib/prisma";

export async function getPointRules() {
  return prisma.pointRule.findMany({ orderBy: { reason: "asc" } });
}

export type PointRuleListItem = Awaited<ReturnType<typeof getPointRules>>[number];
