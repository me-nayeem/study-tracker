import "server-only";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";
import { isSubscriptionActive } from "@/lib/access";
import { formatBoardLabel } from "@/lib/leaderboard-data";

export type StaffUserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

const PAGE_SIZE = 20;

export async function searchStaffUsers(query: string, page: number) {
  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const safePage = Math.max(1, page);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type StudentManagementListItem = {
  studentId: string;
  userId: string;
  name: string | null;
  email: string | null;
  institutionName: string | null;
  boardLabel: string | null;
  isProActive: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  paymentReference: string | null;
};

export async function searchStudentsForManagement(query: string, page: number) {
  const where = {
    user: {
      role: "STUDENT" as const,
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" as const } },
              { name: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
  };

  const safePage = Math.max(1, page);

  const [rows, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where,
      select: {
        id: true,
        institutionName: true,
        board: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            subscription: {
              select: { status: true, currentPeriodEnd: true, paymentReference: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.studentProfile.count({ where }),
  ]);

  const students: StudentManagementListItem[] = rows.map((r) => ({
    studentId: r.id,
    userId: r.user.id,
    name: r.user.name,
    email: r.user.email,
    institutionName: r.institutionName,
    boardLabel: formatBoardLabel(r.board),
    isProActive: isSubscriptionActive(r.user.subscription),
    subscriptionStatus: r.user.subscription?.status ?? null,
    currentPeriodEnd: r.user.subscription?.currentPeriodEnd ?? null,
    paymentReference: r.user.subscription?.paymentReference ?? null,
  }));

  return {
    students,
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
