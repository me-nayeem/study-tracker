"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { inputClass, labelClass } from "@/components/shared/classes";
import type { TrackFilterOptions } from "@/lib/content-data";

export function LecturesFilter({ options }: { options: TrackFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const subjectId = searchParams.get("subjectId") ?? "";
  const paperId = searchParams.get("paperId") ?? "";
  const chapterId = searchParams.get("chapterId") ?? "";
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const selectedSubject = options.find((s) => s.id === subjectId);
  const papers = selectedSubject?.papers ?? [];
  const selectedPaper = papers.find((p) => p.id === paperId);
  const chapters = selectedPaper?.chapters ?? [];

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      updateParams({ q: q || undefined });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search video title…"
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Subject</label>
          <select
            value={subjectId}
            onChange={(e) =>
              updateParams({
                subjectId: e.target.value || undefined,
                paperId: undefined,
                chapterId: undefined,
              })
            }
            className={inputClass}
          >
            <option value="">All subjects</option>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Paper</label>
          <select
            value={paperId}
            disabled={!subjectId}
            onChange={(e) =>
              updateParams({ paperId: e.target.value || undefined, chapterId: undefined })
            }
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">All papers</option>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Chapter</label>
          <select
            value={chapterId}
            disabled={!paperId}
            onChange={(e) => updateParams({ chapterId: e.target.value || undefined })}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">All chapters</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
