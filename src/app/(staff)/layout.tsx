import type { ReactNode } from "react";
import { requireRole } from "@/lib/dal";
import { StaffShell } from "@/components/staff/staff-shell";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(["ADMIN", "MANAGER"]);

  return (
    <StaffShell role={user.role} name={user.name} email={user.email}>
      {children}
    </StaffShell>
  );
}
