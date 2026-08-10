import type { StaffUserListItem } from "@/lib/user-data";
import { RoleSelect } from "./role-select";
import { ActiveToggle } from "./active-toggle";

export function UserCard({ user, isSelf }: { user: StaffUserListItem; isSelf: boolean }) {
  return (
    <div className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{user.name ?? "—"}</p>
          <p className="text-text-secondary truncate text-xs">{user.email}</p>
        </div>
        {isSelf && (
          <span className="bg-accent-primary/10 text-accent-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">
            You
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <RoleSelect userId={user.id} currentRole={user.role} disabled={isSelf} />
        <span
          className={
            user.isActive
              ? "text-state-success text-xs font-medium"
              : "text-state-warning text-xs font-medium"
          }
        >
          {user.isActive ? "Active" : "Deactivated"}
        </span>
      </div>

      <div className="border-bg-elevated mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-text-secondary font-mono text-xs">
          Joined {user.createdAt.toISOString().slice(0, 10)}
        </span>
        <ActiveToggle userId={user.id} isActive={user.isActive} disabled={isSelf} />
      </div>
    </div>
  );
}
