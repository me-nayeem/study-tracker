import "server-only";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getFeedbackList({
  reviewed,
  page,
}: {
  reviewed?: boolean;
  page: number;
}) {
  const where = reviewed === undefined ? {} : { isReviewed: reviewed };
  const safePage = Math.max(1, page);

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        student: { select: { user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    items,
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}