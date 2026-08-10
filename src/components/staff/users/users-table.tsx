import type { StaffUserListItem } from "@/lib/user-data";
import { RoleSelect } from "./role-select";
import { ActiveToggle } from "./active-toggle";
import { UserCard } from "./user-card";

export function UsersTable({
  users,
  currentUserId,
}: {
  users: StaffUserListItem[];
  currentUserId: string;
}) {
  if (users.length === 0) {
    return <p className="text-text-secondary text-sm">No users match your search.</p>;
  }

  return (
    <>
      {/* Mobile: stacked cards — avoids native <select> popup clipping inside a scrolling table */}
      <div className="grid gap-3 md:hidden">
        {users.map((user) => (
          <UserCard key={user.id} user={user} isSelf={user.id === currentUserId} />
        ))}
      </div>

      {/* Desktop/tablet: table */}
      <div className="border-bg-elevated bg-bg-surface hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-bg-elevated text-text-secondary border-b text-xs tracking-wide uppercase">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="border-bg-elevated border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-foreground font-medium">{user.name ?? "—"}</p>
                    <p className="text-text-secondary text-xs">{user.email}</p>
                    {isSelf && (
                      <span className="bg-accent-primary/10 text-accent-primary mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={user.id} currentRole={user.role} disabled={isSelf} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.isActive
                          ? "text-state-success text-xs font-medium"
                          : "text-state-warning text-xs font-medium"
                      }
                    >
                      {user.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="text-text-secondary px-4 py-3 font-mono text-xs">
                    {user.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActiveToggle userId={user.id} isActive={user.isActive} disabled={isSelf} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
