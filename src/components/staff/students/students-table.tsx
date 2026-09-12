import type { StudentManagementListItem } from "@/lib/user-data";
import { StudentProControl } from "./student-pro-control";

export function StudentsTable({
  students,
  canManageSubscriptions,
}: {
  students: StudentManagementListItem[];
  canManageSubscriptions: boolean;
}) {
  if (students.length === 0) {
    return (
      <div className="border-bg-elevated bg-bg-surface rounded-xl border px-6 py-10 text-center">
        <p className="text-text-secondary text-sm">No students found.</p>
      </div>
    );
  }

  return (
    <div className="border-bg-elevated bg-bg-surface overflow-hidden rounded-xl border">
      {students.map((s) => (
        <div
          key={s.studentId}
          className="border-bg-elevated flex flex-col gap-3 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">{s.name ?? s.email}</p>
            <p className="text-text-secondary mt-0.5 truncate text-xs">
              {s.email}
              {s.institutionName ? ` · ${s.institutionName}` : ""}
              {s.boardLabel ? ` · ${s.boardLabel}` : ""}
            </p>
            <div className="mt-1.5">
              {s.isProActive ? (
                <span className="bg-state-premium/15 text-state-premium rounded-full px-2 py-0.5 font-mono text-xs font-medium">
                  Pro until{" "}
                  {s.currentPeriodEnd
                    ? new Date(s.currentPeriodEnd).toLocaleDateString()
                    : "—"}
                </span>
              ) : (
                <span className="bg-bg-elevated text-text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
                  Free
                </span>
              )}
            </div>
          </div>

          {canManageSubscriptions && (
            <div className="shrink-0 sm:w-72">
              <StudentProControl userId={s.userId} isProActive={s.isProActive} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}