import { Suspense } from "react";
import { requireRole } from "@/lib/dal";
import { searchStudentsForManagement } from "@/lib/user-data";
import { UserSearchInput } from "@/components/staff/users/user-search-input";
import { StudentsTable } from "@/components/staff/students/students-table";
import { Pagination } from "@/components/staff/shared/pagination";

export default async function ManagerStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const actor = await requireRole(["ADMIN", "MANAGER"]);
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page) || 1;

  const { students, page: currentPage, totalPages } = await searchStudentsForManagement(
    query,
    page
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Students</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Search students and manage Pro access.
        </p>
      </div>

      <Suspense
        fallback={<div className="border-bg-elevated bg-bg-surface h-10 rounded-lg border" />}
      >
        <UserSearchInput />
      </Suspense>

      <StudentsTable students={students} canManageSubscriptions={actor.role === "ADMIN"} />

      <Pagination
        basePath="/manager/students"
        page={currentPage}
        totalPages={totalPages}
        params={query ? { q: query } : {}}
      />
    </div>
  );
}