import type { AuditLogListItem } from "@/lib/audit-data";
import { ActionBadge } from "./action-badge";
import { MetadataDetails } from "./metadata-details";

function formatTime(date: Date) {
  return date.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function actorLabel(admin: AuditLogListItem["admin"]) {
  return admin.name ?? admin.email ?? admin.id;
}

export function AuditLogList({ logs }: { logs: AuditLogListItem[] }) {
  if (logs.length === 0) {
    return <p className="text-text-secondary text-sm">No audit log entries match these filters.</p>;
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {logs.map((log) => (
          <div key={log.id} className="border-bg-elevated bg-bg-surface rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <ActionBadge action={log.action} />
              <span className="text-text-secondary font-mono text-xs">
                {formatTime(log.createdAt)}
              </span>
            </div>
            <p className="text-foreground mt-2 text-sm font-medium">{log.entityType}</p>
            <p className="text-text-secondary font-mono text-xs">{log.entityId}</p>
            <p className="text-text-secondary mt-1 text-xs">by {actorLabel(log.admin)}</p>
            <div className="mt-2">
              <MetadataDetails metadata={log.metadata} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-bg-elevated bg-bg-surface hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-bg-elevated text-text-secondary border-b text-xs tracking-wide uppercase">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-bg-elevated border-b align-top last:border-0">
                <td className="text-text-secondary px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {formatTime(log.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm">{actorLabel(log.admin)}</td>
                <td className="px-4 py-3">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground text-sm">{log.entityType}</p>
                  <p className="text-text-secondary font-mono text-xs">{log.entityId}</p>
                </td>
                <td className="px-4 py-3">
                  <MetadataDetails metadata={log.metadata} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
