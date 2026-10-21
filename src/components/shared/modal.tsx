"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Dialog rendered into <body> through a portal, so it is never trapped inside a
 * transformed / overflow-hidden parent (e.g. the floating cards).
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "sm",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Callers usually pass an inline function; keep the latest one without re-running the effect
  // (re-running would steal focus from inputs inside the dialog on every render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`animate-card-in bg-bg-surface flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-white/8 shadow-2xl outline-none sm:rounded-2xl ${
          size === "md" ? "sm:max-w-lg" : "sm:max-w-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-3.5">
          <h2 id={titleId} className="font-display text-foreground min-w-0 truncate text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-foreground/70 hover:text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 transition-colors hover:bg-white/12"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
