"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Calculator, Delete, X } from "lucide-react";
import { evaluateExpression, formatNumber, CalcError, type AngleMode } from "@/lib/calc-eval";

/**
 * How a key behaves when pressed:
 * - value: starts or continues an operand (digits, π, functions, "(")
 * - op: binary operator; replaces a trailing operator instead of stacking
 * - postfix: ! % ) and x², only after a complete operand
 */
type KeyKind = "value" | "op" | "postfix";

type FnKey = { label: string; insert: string; kind: KeyKind; aria?: string };

/** Function keys; the second entry is what the key does while INV is on. */
const FN_ROWS: [FnKey, FnKey | null][][] = [
  [
    [
      { label: "sin", insert: "sin(", kind: "value" },
      { label: "sin⁻¹", insert: "asin(", kind: "value" },
    ],
    [
      { label: "cos", insert: "cos(", kind: "value" },
      { label: "cos⁻¹", insert: "acos(", kind: "value" },
    ],
    [
      { label: "tan", insert: "tan(", kind: "value" },
      { label: "tan⁻¹", insert: "atan(", kind: "value" },
    ],
    [{ label: "π", insert: "pi", kind: "value", aria: "pi" }, null],
  ],
  [
    [
      { label: "√", insert: "sqrt(", kind: "value", aria: "square root" },
      { label: "x²", insert: "^2", kind: "postfix", aria: "squared" },
    ],
    [
      { label: "log", insert: "log(", kind: "value" },
      { label: "10ˣ", insert: "10^(", kind: "value", aria: "ten to the power" },
    ],
    [
      { label: "ln", insert: "ln(", kind: "value" },
      { label: "eˣ", insert: "e^(", kind: "value", aria: "e to the power" },
    ],
    [{ label: "xʸ", insert: "^", kind: "op", aria: "power" }, null],
    [{ label: "e", insert: "e", kind: "value" }, null],
  ],
  [
    [{ label: "(", insert: "(", kind: "value" }, null],
    [{ label: ")", insert: ")", kind: "postfix", aria: "close bracket" }, null],
    [{ label: "x!", insert: "!", kind: "postfix", aria: "factorial" }, null],
    [{ label: "%", insert: "%", kind: "postfix", aria: "percent" }, null],
    [{ label: "Ans", insert: "Ans", kind: "value", aria: "last answer" }, null],
  ],
];

const OPERATORS = "+-*/^";
const FUNCTION_TOKEN = /(asin|acos|atan|sin|cos|tan|log|ln|sqrt)\($|(pi|Ans)$/;
/** An expression ending like this is a complete operand: ! % ) and operators may follow. */
const ENDS_WITH_OPERAND = /([0-9.)!%e]|pi|Ans)$/;
const MAX_LENGTH = 120;

/** Internal expression → what the student sees. */
function prettify(expression: string): string {
  return expression
    .replace(/a(sin|cos|tan)\(/g, "$1⁻¹(")
    .replace(/sqrt\(/g, "√(")
    .replace(/pi/g, "π")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−");
}

function unclosedBrackets(expression: string): number {
  return (expression.match(/\(/g)?.length ?? 0) - (expression.match(/\)/g)?.length ?? 0);
}

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [inverse, setInverse] = useState(false);
  const [ans, setAns] = useState<number | null>(null);
  // after "=", a digit starts a new calculation while an operator continues from Ans
  const [justEvaluated, setJustEvaluated] = useState(false);
  const expressionRef = useRef<HTMLDivElement>(null);

  // keep the end of a long expression in view
  useEffect(() => {
    const el = expressionRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [expression]);

  // live answer while typing, shown dimmed until "=" is pressed
  const preview = useMemo(() => {
    if (justEvaluated || !/[-+*/^%!(]|pi|Ans|e/.test(expression.replace(/^-/, ""))) return null;
    try {
      return formatNumber(evaluateExpression(expression, angleMode, ans));
    } catch {
      return null;
    }
  }, [expression, angleMode, ans, justEvaluated]);

  function press(token: string, kind: KeyKind) {
    // right after "=", a new operand starts fresh while anything else builds on Ans
    const base = justEvaluated ? (kind === "value" ? "" : "Ans") : expression;
    const next = nextExpression(base, token, kind, ans !== null);
    if (next === null || next.length > MAX_LENGTH) return;

    setExpression(next);
    setError(null);
    setInverse(false);
    setJustEvaluated(false);
    setResult(null);
  }

  function evaluate() {
    if (!expression) return;
    try {
      const value = evaluateExpression(expression, angleMode, ans);
      // show the brackets that were closed automatically
      setExpression((prev) => prev + ")".repeat(Math.max(0, unclosedBrackets(prev))));
      setResult(formatNumber(value));
      setAns(value);
      setJustEvaluated(true);
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof CalcError ? err.message : "Syntax error");
    }
  }

  function backspace() {
    setError(null);
    setJustEvaluated(false);
    setResult(null);
    setExpression((prev) => {
      const fn = FUNCTION_TOKEN.exec(prev);
      return fn ? prev.slice(0, fn.index) : prev.slice(0, -1);
    });
  }

  function clearAll() {
    setExpression("");
    setResult(null);
    setError(null);
    setJustEvaluated(false);
    setInverse(false);
  }

  // Physical keyboard while open; ignored when the student is typing somewhere else.
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      target?.closest("input, textarea, select, [contenteditable='true']")
    ) {
      return;
    }
    const key = e.key;
    if (/^[0-9.]$/.test(key) || key === "(") press(key, "value");
    else if (key.length === 1 && OPERATORS.includes(key)) press(key, "op");
    else if (key === ")" || key === "!" || key === "%") press(key, "postfix");
    else if (key === "Enter" || key === "=") evaluate();
    else if (key === "Backspace") backspace();
    else if (key === "Delete") clearAll();
    else if (key === "Escape") setIsOpen(false);
    else return;
    e.preventDefault();
  });

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const mainLine = error ?? result ?? preview;

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-3 sm:right-6 md:bottom-6">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calculator"
          className="animate-card-in card-surface text-foreground max-h-[calc(100dvh-10rem)] w-[320px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[1.5rem] p-3 shadow-2xl"
        >
          <div className="mb-2.5 flex items-center justify-between px-1">
            <span className="text-sm font-semibold">Calculator</span>
            <div className="flex rounded-lg bg-white/5 p-0.5" role="group" aria-label="Angle unit">
              {(["DEG", "RAD"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAngleMode(mode)}
                  aria-pressed={angleMode === mode}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                    angleMode === mode
                      ? "bg-bg-elevated text-foreground shadow-sm"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* display */}
          <div className="card-well mb-3 rounded-2xl px-3.5 pt-2.5 pb-3">
            <div className="text-text-secondary flex h-4 items-center justify-between text-[10px] font-semibold">
              <span>{inverse ? "INV" : ""}</span>
              <span>{ans !== null ? `Ans = ${formatNumber(ans)}` : ""}</span>
            </div>
            <div
              ref={expressionRef}
              className="text-foreground/75 mt-1 min-h-6 [scrollbar-width:none] overflow-x-auto text-right text-base whitespace-nowrap"
            >
              {prettify(expression) || "0"}
            </div>
            <div
              aria-live="polite"
              className={`mt-0.5 min-h-9 truncate text-right text-3xl font-semibold tabular-nums ${
                error
                  ? "text-state-warning text-2xl"
                  : result
                    ? "text-foreground"
                    : "text-foreground/40"
              }`}
              title={mainLine ?? undefined}
            >
              {mainLine ? (error || result ? mainLine : `= ${mainLine}`) : " "}
            </div>
          </div>

          {/* function keys */}
          <div className="mb-2 grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() => setInverse((v) => !v)}
              aria-pressed={inverse}
              aria-label="Inverse functions"
              className={`h-9 rounded-xl text-xs font-semibold transition-colors ${
                inverse ? "bg-gold text-ink" : "text-foreground/80 bg-white/4 hover:bg-white/8"
              }`}
            >
              INV
            </button>
            {FN_ROWS.flat().map(([normal, alt]) => {
              const key = inverse && alt ? alt : normal;
              return (
                <button
                  key={normal.label}
                  type="button"
                  onClick={() => press(key.insert, key.kind)}
                  aria-label={key.aria ?? key.label}
                  className={`h-9 rounded-xl text-[13px] font-medium transition-colors ${
                    inverse && alt
                      ? "bg-gold/10 text-gold hover:bg-gold/15"
                      : "text-foreground/80 bg-white/4 hover:bg-white/8"
                  }`}
                >
                  {key.label}
                </button>
              );
            })}
          </div>

          {/* number pad */}
          <div className="grid grid-cols-5 gap-1.5">
            {["7", "8", "9"].map((d) => (
              <DigitKey key={d} digit={d} onPress={press} />
            ))}
            <ActionKey label="Backspace" onClick={backspace}>
              <Delete className="h-5 w-5" />
            </ActionKey>
            <ActionKey label="Clear all" onClick={clearAll} tone="danger">
              AC
            </ActionKey>

            {["4", "5", "6"].map((d) => (
              <DigitKey key={d} digit={d} onPress={press} />
            ))}
            <OperatorKey label="×" aria="multiply" onClick={() => press("*", "op")} />
            <OperatorKey label="÷" aria="divide" onClick={() => press("/", "op")} />

            {["1", "2", "3"].map((d) => (
              <DigitKey key={d} digit={d} onPress={press} />
            ))}
            <OperatorKey label="+" aria="plus" onClick={() => press("+", "op")} />
            <OperatorKey label="−" aria="minus" onClick={() => press("-", "op")} />

            <DigitKey digit="0" onPress={press} wide />
            <DigitKey digit="." onPress={press} />
            <button
              type="button"
              onClick={evaluate}
              aria-label="Equals"
              className="bg-gold text-ink hover:bg-gold-soft col-span-2 h-12 rounded-xl text-xl font-semibold transition-colors active:scale-[0.97]"
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
        aria-expanded={isOpen}
        className="bg-gold text-ink hover:bg-gold-soft flex h-14 w-14 items-center justify-center rounded-full shadow-[0_12px_28px_-10px_rgb(0_0_0/0.8)] transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Calculator className="h-6 w-6" />}
      </button>
    </div>
  );
}

/**
 * Applies one key press to the expression, or returns null when the key makes no sense there
 * (e.g. "×" with nothing before it, a second "." in a number, ")" with nothing to close).
 */
function nextExpression(
  expression: string,
  token: string,
  kind: KeyKind,
  hasAns: boolean
): string | null {
  const last = expression.at(-1) ?? "";

  if (token === ".") {
    const number = /[0-9.]*$/.exec(expression)![0];
    if (number.includes(".")) return null;
    return expression + (number ? "." : "0.");
  }

  if (kind === "value") return expression + token;

  if (kind === "postfix") {
    // "Ans" is only a stand-in here when there is a previous answer to use
    if (expression === "Ans" && !hasAns) return null;
    if (!ENDS_WITH_OPERAND.test(expression)) return null;
    if (token === ")" && unclosedBrackets(expression) <= 0) return null;
    return expression + token;
  }

  // binary operator (or "^2")
  if (!expression) {
    if (token === "-") return "-";
    return hasAns ? "Ans" + token : null;
  }
  if (last === "(") return token === "-" ? expression + "-" : null;
  if (OPERATORS.includes(last)) {
    // allow a negative sign after ×, ÷ or ^ (2×−3); otherwise swap the operator
    if (token === "-" && "*/^".includes(last)) return expression + "-";
    const trimmed = expression.replace(/[-+*/^]+$/, "");
    return trimmed ? trimmed + token : token === "-" ? "-" : null;
  }
  return expression + token;
}

function DigitKey({
  digit,
  onPress,
  wide = false,
}: {
  digit: string;
  onPress: (token: string, kind: KeyKind) => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(digit, "value")}
      aria-label={digit === "." ? "decimal point" : digit}
      className={`bg-bg-elevated text-foreground h-12 rounded-xl text-lg font-medium transition-colors hover:bg-white/12 active:scale-[0.97] ${
        wide ? "col-span-2" : ""
      }`}
    >
      {digit}
    </button>
  );
}

function OperatorKey({
  label,
  aria,
  onClick,
}: {
  label: string;
  aria: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="bg-gold/10 text-gold hover:bg-gold/15 h-12 rounded-xl text-xl font-medium transition-colors active:scale-[0.97]"
    >
      {label}
    </button>
  );
}

function ActionKey({
  label,
  onClick,
  tone = "neutral",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors active:scale-[0.97] ${
        tone === "danger"
          ? "bg-state-warning/15 text-state-warning hover:bg-state-warning/25"
          : "text-foreground/80 bg-white/6 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
