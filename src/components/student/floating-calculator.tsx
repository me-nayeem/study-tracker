"use client";

import { useCallback, useState } from "react";
import { Calculator, Delete, X } from "lucide-react";
import { evaluateExpression, CalcError, type AngleMode } from "@/lib/calc-eval";

type CalcKey = { label: string; insert: string };

const FUNCTION_KEYS: CalcKey[] = [
  { label: "sin", insert: "sin(" },
  { label: "cos", insert: "cos(" },
  { label: "tan", insert: "tan(" },
  { label: "^", insert: "^" },
  { label: "log", insert: "log(" },
  { label: "ln", insert: "ln(" },
  { label: "√", insert: "sqrt(" },
  { label: "%", insert: "%" },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
  { label: "π", insert: "pi" },
  { label: "e", insert: "e" },
];

const DIGIT_KEYS: CalcKey[] = [
  { label: "7", insert: "7" },
  { label: "8", insert: "8" },
  { label: "9", insert: "9" },
  { label: "÷", insert: "/" },
  { label: "4", insert: "4" },
  { label: "5", insert: "5" },
  { label: "6", insert: "6" },
  { label: "×", insert: "*" },
  { label: "1", insert: "1" },
  { label: "2", insert: "2" },
  { label: "3", insert: "3" },
  { label: "−", insert: "-" },
  { label: "0", insert: "0" },
  { label: ".", insert: "." },
];

function formatResult(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(8)).toString();
}

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");

  const insert = useCallback((token: string) => {
    setError(null);
    setExpression((prev) => prev + token);
  }, []);

  const handleEvaluate = useCallback(() => {
    try {
      const value = evaluateExpression(expression, angleMode);
      setResult(formatResult(value));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof CalcError ? err.message : "Invalid expression");
    }
  }, [expression, angleMode]);

  function handleClear() {
    setExpression("");
    setResult(null);
    setError(null);
  }

  function handleBackspace() {
    setError(null);
    setExpression((prev) => prev.slice(0, -1));
  }

  return (
    <div className="fixed right-6 bottom-20 z-50 flex flex-col items-end gap-3 md:bottom-6">
      {isOpen && (
        <div
          className="card-in w-[300px] rounded-2xl border p-4 shadow-xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--bg-elevated)",
            color: "var(--foreground)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--text-text-secondary)" }}>
              Scientific Calculator
            </span>
            <button
              type="button"
              onClick={() => setAngleMode((m) => (m === "DEG" ? "RAD" : "DEG"))}
              className="rounded-md px-2 py-1 font-mono text-xs font-semibold"
              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--accent-primary)" }}
            >
              {angleMode}
            </button>
          </div>

          <div className="mb-3 rounded-lg p-3" style={{ backgroundColor: "var(--background)" }}>
            <div
              className="min-h-[1.1rem] overflow-x-auto text-right font-mono text-sm whitespace-nowrap"
              style={{ color: "var(--text-text-secondary)" }}
            >
              {expression || "0"}
            </div>
            <div
              className="truncate text-right font-mono text-xl font-semibold"
              style={{ color: error ? "var(--state-warning)" : "var(--foreground)" }}
            >
              {error ?? result ?? "\u00A0"}
            </div>
          </div>

          <div className="mb-2 grid grid-cols-4 gap-2">
            {FUNCTION_KEYS.map((key) => (
              <button
                key={key.label}
                type="button"
                onClick={() => insert(key.insert)}
                className="rounded-lg py-2 font-mono text-xs transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--foreground)" }}
              >
                {key.label}
              </button>
            ))}
          </div>

          <div className="mb-2 grid grid-cols-4 gap-2">
            {DIGIT_KEYS.map((key) => (
              <button
                key={key.label}
                type="button"
                onClick={() => insert(key.insert)}
                className="rounded-lg py-2 font-mono text-sm transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--foreground)" }}
              >
                {key.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Backspace"
              className="flex items-center justify-center rounded-lg py-2 transition-colors hover:opacity-80"
              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--foreground)" }}
            >
              <Delete className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insert("+")}
              className="rounded-lg py-2 font-mono text-sm transition-colors hover:opacity-80"
              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--foreground)" }}
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--state-warning)", color: "var(--background)" }}
            >
              C
            </button>
            <button
              type="button"
              onClick={handleEvaluate}
              className="rounded-lg py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--accent-primary)", color: "var(--background)" }}
            >
              =
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close calculator" : "Open calculator"}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--accent-primary)", color: "var(--background)" }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Calculator className="h-6 w-6" />}
      </button>
    </div>
  );
}
