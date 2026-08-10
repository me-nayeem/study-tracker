import { requireRole } from "@/lib/dal";
import { StaffPlaceholder } from "@/components/staff/staff-placeholder";

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);
  return <StaffPlaceholder title="Admin dashboard" note="Quick stats land here in a later step." />;
}
