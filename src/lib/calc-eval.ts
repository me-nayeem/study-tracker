type AngleMode = "DEG" | "RAD";

/** "Syntax" = the expression can't be read; "Math" = it can, but has no real answer (÷0, √-1…). */
class CalcError extends Error {
  constructor(public readonly kind: "Syntax" | "Math") {
    super(`${kind} error`);
  }
}

const FUNCTIONS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt"]);
const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

/** Results this close to zero are floating-point noise (e.g. sin 180° = 1.2e-16). */
const EPSILON = 1e-12;

type Token =
  { type: "num"; value: number } | { type: "ident"; value: string } | { type: "op"; value: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const s = input.replace(/\s+/g, "");
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if (raw === "." || (raw.match(/\./g) || []).length > 1) throw new CalcError("Syntax");
      tokens.push({ type: "num", value: Number(raw) });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      // "Ans" and function names are whole words; anything else is split into single
      // letters so "pie" can't be mistaken for one word ("pi·e" is handled below).
      const word = /^(Ans|asin|acos|atan|sin|cos|tan|log|ln|sqrt|pi|e)/.exec(s.slice(i));
      if (!word) throw new CalcError("Syntax");
      tokens.push({ type: "ident", value: word[1] });
      i += word[1].length;
      continue;
    }

    if ("+-*/^%!()".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }

    throw new CalcError("Syntax");
  }

  return tokens;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) throw new CalcError("Math");
  let result = 1;
  for (let k = 2; k <= n; k++) result *= k;
  return result;
}

const snap = (value: number) => (Math.abs(value) < EPSILON ? 0 : value);

/**
 * Evaluates a calculator expression.
 *
 * Grammar (loosest to tightest):
 *   expression := term (("+" | "-") term)*
 *   term       := unary (("*" | "/") unary | power)*   — the bare `power` is implicit ×: 2π, 3(4)
 *   unary      := ("-" | "+") unary | power             — so -2^2 = -(2^2)
 *   power      := postfix ("^" unary)?                  — right-associative, 2^-1 allowed
 *   postfix    := primary ("!" | "%")*                  — 5! and 50% (= 0.5)
 *   primary    := number | Ans | π | e | fn "(" expression ")" | "(" expression ")"
 *
 * Missing closing brackets are added automatically, like a hand calculator.
 */
export function evaluateExpression(
  input: string,
  angleMode: AngleMode,
  ans: number | null = null
): number {
  const tokens = tokenize(input);
  if (tokens.length === 0) throw new CalcError("Syntax");

  let depth = 0;
  for (const t of tokens) {
    if (t.type !== "op") continue;
    if (t.value === "(") depth++;
    if (t.value === ")") depth--;
    if (depth < 0) throw new CalcError("Syntax");
  }
  for (; depth > 0; depth--) tokens.push({ type: "op", value: ")" });

  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (t: Token | undefined, ...values: string[]) =>
    t?.type === "op" && values.includes(t.value);

  function consume(expected?: string): Token {
    const t = tokens[pos];
    if (!t || (expected && !isOp(t, expected))) throw new CalcError("Syntax");
    pos++;
    return t;
  }

  const toRadians = (angle: number) => (angleMode === "DEG" ? (angle * Math.PI) / 180 : angle);
  const fromRadians = (rad: number) => (angleMode === "DEG" ? (rad * 180) / Math.PI : rad);

  function parseExpression(): number {
    let value = parseTerm();
    while (isOp(peek(), "+", "-")) {
      const op = consume().value;
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (true) {
      const t = peek();
      if (isOp(t, "*", "/")) {
        const op = consume().value;
        const rhs = parseUnary();
        if (op === "*") value *= rhs;
        else {
          if (rhs === 0) throw new CalcError("Math");
          value /= rhs;
        }
      } else if (t && (t.type === "num" || t.type === "ident" || isOp(t, "("))) {
        value *= parsePower();
      } else {
        return value;
      }
    }
  }

  function parseUnary(): number {
    if (isOp(peek(), "-", "+")) {
      const op = consume().value;
      const value = parseUnary();
      return op === "-" ? -value : value;
    }
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePostfix();
    if (!isOp(peek(), "^")) return base;
    consume("^");
    const exponent = parseUnary();
    if (base === 0 && exponent <= 0) throw new CalcError("Math");
    return Math.pow(base, exponent);
  }

  function parsePostfix(): number {
    let value = parsePrimary();
    while (isOp(peek(), "!", "%")) {
      value = consume().value === "!" ? factorial(value) : value / 100;
    }
    return value;
  }

  function parsePrimary(): number {
    const t = consume();

    if (t.type === "num") return t.value;

    if (isOp(t, "(")) {
      const value = parseExpression();
      consume(")");
      return value;
    }

    if (t.type !== "ident") throw new CalcError("Syntax");

    if (t.value === "Ans") {
      if (ans === null) throw new CalcError("Syntax");
      return ans;
    }
    if (t.value in CONSTANTS) return CONSTANTS[t.value];
    if (!FUNCTIONS.has(t.value)) throw new CalcError("Syntax");

    consume("(");
    const arg = parseExpression();
    consume(")");
    return applyFunction(t.value, arg);
  }

  function applyFunction(name: string, arg: number): number {
    switch (name) {
      case "sin":
        return snap(Math.sin(toRadians(arg)));
      case "cos":
        return snap(Math.cos(toRadians(arg)));
      case "tan": {
        // tan 90°, tan 270°… are undefined rather than a huge number
        if (Math.abs(Math.cos(toRadians(arg))) < EPSILON) throw new CalcError("Math");
        return snap(Math.tan(toRadians(arg)));
      }
      case "asin":
      case "acos": {
        if (arg < -1 || arg > 1) throw new CalcError("Math");
        return fromRadians(name === "asin" ? Math.asin(arg) : Math.acos(arg));
      }
      case "atan":
        return fromRadians(Math.atan(arg));
      case "log":
        if (arg <= 0) throw new CalcError("Math");
        return Math.log10(arg);
      case "ln":
        if (arg <= 0) throw new CalcError("Math");
        return Math.log(arg);
      case "sqrt":
        if (arg < 0) throw new CalcError("Math");
        return Math.sqrt(arg);
      default:
        throw new CalcError("Syntax");
    }
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new CalcError("Syntax");
  if (!Number.isFinite(result)) throw new CalcError("Math");
  return result;
}

/** 12 significant digits, scientific notation only for very large or very small values. */
export function formatNumber(value: number): string {
  if (value === 0) return "0"; // also turns -0 into 0
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-9) {
    const [mantissa, exponent] = value.toExponential(9).split("e");
    return `${Number(mantissa)}e${Number(exponent)}`;
  }
  return String(Number(value.toPrecision(12)));
}

export { CalcError };
export type { AngleMode };
