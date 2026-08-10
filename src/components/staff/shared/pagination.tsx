import Link from "next/link";
import { buttonSecondaryClass } from "@/components/staff/curriculum/classes";

export function Pagination({
  basePath,
  page,
  totalPages,
  params,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const search = new URLSearchParams(params);
    search.set("page", String(p));
    return `${basePath}?${search.toString()}`;
  }

  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-text-secondary text-xs">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`${buttonSecondaryClass} ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`${buttonSecondaryClass} ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
