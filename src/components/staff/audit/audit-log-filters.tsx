"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/lib/audit";
import { inputClass, labelClass } from "@/components/staff/curriculum/classes";

export function AuditLogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={labelClass}>Entity type</label>
        <select
          value={searchParams.get("entityType") ?? ""}
          onChange={(e) => updateParam("entityType", e.target.value)}
          className={inputClass}
        >
          <option value="">All entities</option>
          {AUDIT_ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Action</label>
        <select
          value={searchParams.get("action") ?? ""}
          onChange={(e) => updateParam("action", e.target.value)}
          className={inputClass}
        >
          <option value="">All actions</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
