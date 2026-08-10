import type { Role } from "@/generated/prisma/client";

export type StaffNavItem = {
  label: string;
  href: string;
  roles: Role[];
};

export type StaffNavGroup = {
  label: string;
  roles: Role[];
  items: StaffNavItem[];
};

export type StaffNavEntry =
  { type: "link"; item: StaffNavItem } | { type: "group"; group: StaffNavGroup };

export const STAFF_NAV: StaffNavEntry[] = [
  {
    type: "link",
    item: { label: "Dashboard", href: "/manager", roles: ["ADMIN", "MANAGER"] },
  },
  {
    type: "group",
    group: {
      label: "Content",
      roles: ["ADMIN", "MANAGER"],
      items: [
        { label: "Playlists", href: "/manager/playlists", roles: ["ADMIN", "MANAGER"] },
        { label: "Special videos", href: "/manager/special-videos", roles: ["ADMIN", "MANAGER"] },
        {
          label: "Notes moderation",
          href: "/manager/notes-moderation",
          roles: ["ADMIN", "MANAGER"],
        },
        { label: "Official notes", href: "/manager/official-notes", roles: ["ADMIN", "MANAGER"] },
      ],
    },
  },
  {
    type: "group",
    group: {
      label: "Exams",
      roles: ["ADMIN", "MANAGER"],
      items: [
        { label: "Exam results", href: "/manager/exam-results", roles: ["ADMIN", "MANAGER"] },
        { label: "Disputes", href: "/admin/exam-disputes", roles: ["ADMIN"] },
      ],
    },
  },
  {
    type: "link",
    item: { label: "Students", href: "/manager/students", roles: ["ADMIN", "MANAGER"] },
  },
  {
    type: "group",
    group: {
      label: "Admin",
      roles: ["ADMIN"],
      items: [
        { label: "Curriculum", href: "/admin/curriculum", roles: ["ADMIN"] },
        { label: "Staff & roles", href: "/admin/staff-roles", roles: ["ADMIN"] },
        { label: "Pricing", href: "/admin/pricing", roles: ["ADMIN"] },
        { label: "Point rules", href: "/admin/point-rules", roles: ["ADMIN"] },
        { label: "Audit log", href: "/admin/audit-log", roles: ["ADMIN"] },
      ],
    },
  },
];
