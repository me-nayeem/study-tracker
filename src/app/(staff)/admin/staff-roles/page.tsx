import { Suspense } from "react";
import { requireRole } from "@/lib/dal";
import { searchStaffUsers } from "@/lib/user-data";
import { UserSearchInput } from "@/components/staff/users/user-search-input";
import { UsersTable } from "@/components/staff/users/users-table";
import { Pagination } from "@/components/staff/shared/pagination";

export default async function StaffRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const actor = await requireRole(["ADMIN"]);
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page) || 1;

  const { users, page: currentPage, totalPages } = await searchStaffUsers(query, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Staff & Roles</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Promote users to Manager or Admin, or deactivate accounts.
        </p>
      </div>

      <Suspense
        fallback={<div className="border-bg-elevated bg-bg-surface h-10 rounded-lg border" />}
      >
        <UserSearchInput />
      </Suspense>

      <UsersTable users={users} currentUserId={actor.id} />

      <Pagination
        basePath="/admin/staff-roles"
        page={currentPage}
        totalPages={totalPages}
        params={query ? { q: query } : {}}
      />
    </div>
  );
}
