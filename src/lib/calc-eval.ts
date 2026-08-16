type AngleMode = "DEG" | "RAD";

class CalcError extends Error {}

const FUNCTIONS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt"]);
const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

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
      if ((raw.match(/\./g) || []).length > 1) throw new CalcError("Invalid number");
      tokens.push({ type: "num", value: Number(raw) });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      tokens.push({ type: "ident", value: s.slice(i, j) });
      i = j;
      continue;
    }

    if ("+-*/^%()".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }

    throw new CalcError(`Unexpected character: ${c}`);
  }

  return tokens;
}

export function evaluateExpression(input: string, angleMode: AngleMode): number {
  if (!input.trim()) return 0;

  const tokens = tokenize(input);
  let pos = 0;

  const peek = () => tokens[pos];
  function consume(expected?: string): Token {
    const t = tokens[pos];
    if (!t) throw new CalcError("Unexpected end of expression");
    if (expected && !(t.type === "op" && t.value === expected)) {
      throw new CalcError(`Expected "${expected}"`);
    }
    pos++;
    return t;
  }

  const toRadians = (deg: number) => (angleMode === "DEG" ? (deg * Math.PI) / 180 : deg);
  const fromRadians = (rad: number) => (angleMode === "DEG" ? (rad * 180) / Math.PI : rad);

  function parseExpression(): number {
    let value = parseTerm();
    while (true) {
      const t = peek();
      if (!t || t.type !== "op" || (t.value !== "+" && t.value !== "-")) break;
      const op = consume().value;
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parsePower();
    while (true) {
      const t = peek();
      if (!t || t.type !== "op" || !["*", "/", "%"].includes(t.value)) break;
      const op = consume().value;
      const rhs = parsePower();
      if (op === "*") value *= rhs;
      else if (op === "/") {
        if (rhs === 0) throw new CalcError("Division by zero");
        value /= rhs;
      } else value %= rhs;
    }
    return value;
  }

  function parsePower(): number {
    const base = parseUnary();
    if (peek()?.type === "op" && peek()!.value === "^") {
      consume("^");
      return Math.pow(base, parsePower());
    }
    return base;
  }

  function parseUnary(): number {
    const t = peek();
    if (t?.type === "op" && (t.value === "-" || t.value === "+")) {
      consume();
      const value = parseUnary();
      return t.value === "-" ? -value : value;
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const t = peek();
    if (!t) throw new CalcError("Unexpected end of expression");

    if (t.type === "num") {
      consume();
      return t.value;
    }

    if (t.type === "op" && t.value === "(") {
      consume("(");
      const value = parseExpression();
      consume(")");
      return value;
    }

    if (t.type === "ident") {
      const name = t.value;
      consume();

      if (name in CONSTANTS) return CONSTANTS[name];

      if (FUNCTIONS.has(name)) {
        consume("(");
        const arg = parseExpression();
        consume(")");

        switch (name) {
          case "sin":
            return Math.sin(toRadians(arg));
          case "cos":
            return Math.cos(toRadians(arg));
          case "tan":
            return Math.tan(toRadians(arg));
          case "asin":
            return fromRadians(Math.asin(arg));
          case "acos":
            return fromRadians(Math.acos(arg));
          case "atan":
            return fromRadians(Math.atan(arg));
          case "log":
            if (arg <= 0) throw new CalcError("log of non-positive number");
            return Math.log10(arg);
          case "ln":
            if (arg <= 0) throw new CalcError("ln of non-positive number");
            return Math.log(arg);
          case "sqrt":
            if (arg < 0) throw new CalcError("sqrt of negative number");
            return Math.sqrt(arg);
          default:
            throw new CalcError(`Unknown function: ${name}`);
        }
      }

      throw new CalcError(`Unknown identifier: ${name}`);
    }

    throw new CalcError("Unexpected token");
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new CalcError("Unexpected trailing input");
  if (!Number.isFinite(result)) throw new CalcError("Result is not a finite number");
  return result;
}

export { CalcError };
export type { AngleMode };
