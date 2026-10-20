"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ToastTone = "error" | "success" | "info";
type Toast = { id: number; message: string; tone: ToastTone };

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: (message: string, tone?: ToastTone) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const TOAST_DURATION_MS = 4500;

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<
    (ConfirmOptions & { resolve: (ok: boolean) => void }) | null
  >(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
      }),
    []
  );

  const toast = useCallback((message: string, tone: ToastTone = "error") => {
    const id = nextToastId.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  function settle(ok: boolean) {
    pending?.resolve(ok);
    setPending(null);
  }

  return (
    <DialogContext.Provider value={{ confirm, toast }}>
      {children}
      {pending && <ConfirmDialog options={pending} onSettle={settle} />}
      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </DialogContext.Provider>
  );
}

function ConfirmDialog({
  options,
  onSettle,
}: {
  options: ConfirmOptions;
  onSettle: (ok: boolean) => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive } = options;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Destructive actions default focus to Cancel so Enter can't delete by accident.
    (destructive ? cancelRef : confirmRef).current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onSettle(false);
      if (e.key === "Tab") {
        // keep focus inside the two buttons
        const order = [cancelRef.current, confirmRef.current];
        const index = order.indexOf(document.activeElement as HTMLButtonElement);
        e.preventDefault();
        order[(index + (e.shiftKey ? order.length - 1 : 1)) % order.length]?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => onSettle(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={message ? "confirm-dialog-message" : undefined}
        onClick={(e) => e.stopPropagation()}
        className="animate-card-in border-bg-elevated bg-bg-surface w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="bg-state-warning/15 text-state-warning flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <AlertTriangle className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="font-display text-foreground text-lg">
              {title}
            </h2>
            {message && (
              <p id="confirm-dialog-message" className="text-text-secondary mt-1 text-sm">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onSettle(false)}
            className="border-bg-elevated text-text-secondary hover:text-foreground hover:bg-bg-elevated rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onSettle(true)}
            className={`text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${
              destructive ? "bg-state-warning" : "bg-accent-primary"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const TONE_STYLES: Record<ToastTone, string> = {
  error: "border-state-warning/40 text-state-warning",
  success: "border-state-success/40 text-state-success",
  info: "border-bg-elevated text-foreground",
};

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-70 flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className={`animate-card-in bg-bg-surface pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 shadow-xl ${TONE_STYLES[t.tone]}`}
        >
          {t.tone === "error" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="text-foreground min-w-0 flex-1 text-sm">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="text-text-secondary hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useConfirm/useToast must be used inside <DialogProvider>");
  return ctx;
}

export function useConfirm() {
  return useDialogContext().confirm;
}

export function useToast() {
  return useDialogContext().toast;
}
