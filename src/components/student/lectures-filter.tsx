"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { TrackFilterOptions } from "@/lib/content-data";

const fieldClass =
  "border-gold/20 bg-ink/80 text-foreground placeholder:text-text-secondary focus-visible:border-gold w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-45";
const labelClass =
  "text-gold-soft/70 mb-1.5 block text-[10px] font-medium tracking-[0.18em] uppercase";

export function LecturesFilter({ options }: { options: TrackFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
    <div className="space-y-4">
      <div className="relative">
        <Search className="text-gold-soft/70 pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search playlist title…"
          aria-label="Search playlists"
          className={`${fieldClass} pl-10`}
        />
        {isPending && (
          <span className="border-gold/30 border-t-gold absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FilterSelect
          label="Subject"
          value={subjectId}
          onChange={(value) =>
            updateParams({
              subjectId: value || undefined,
              paperId: undefined,
              chapterId: undefined,
            })
          }
          placeholder="All subjects"
          options={options}
        />
        <FilterSelect
          label="Paper"
          value={paperId}
          disabled={!subjectId}
          onChange={(value) => updateParams({ paperId: value || undefined, chapterId: undefined })}
          placeholder="All papers"
          options={papers}
        />
        <FilterSelect
          label="Chapter"
          value={chapterId}
          disabled={!paperId}
          onChange={(value) => updateParams({ chapterId: value || undefined })}
          placeholder="All chapters"
          options={chapters}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  disabled,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  options: { id: string; name: string }[];
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <ChevronDown className="text-gold-soft/70 pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
      </span>
    </label>
  );
}
