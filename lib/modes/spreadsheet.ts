import { argumentError, syntaxError } from "@/lib/engine";

export type Cells = Record<string, string>;

export function refName(column: number, row: number): string {
  let col = column;
  let letters = "";
  do {
    letters = String.fromCharCode(65 + (col % 26)) + letters;
    col = Math.floor(col / 26) - 1;
  } while (col >= 0);
  return `${letters}${row + 1}`;
}

export function parseRef(ref: string): { column: number; row: number } {
  const match = /^([A-Za-z]+)([0-9]+)$/.exec(ref.trim());
  if (!match) throw syntaxError(`Invalid cell reference ${ref}`);
  const letters = match[1]!.toUpperCase();
  const row = Number(match[2]) - 1;
  let column = 0;
  for (const char of letters) column = column * 26 + (char.charCodeAt(0) - 64);
  return { column: column - 1, row };
}

export function expandRange(from: string, to: string): string[] {
  const start = parseRef(from);
  const end = parseRef(to);
  const refs: string[] = [];
  for (
    let row = Math.min(start.row, end.row);
    row <= Math.max(start.row, end.row);
    row += 1
  ) {
    for (
      let column = Math.min(start.column, end.column);
      column <= Math.max(start.column, end.column);
      column += 1
    ) {
      refs.push(refName(column, row));
    }
  }
  return refs;
}

interface SheetContext {
  cells: Cells;
  cache: Map<string, number>;
  visiting: Set<string>;
}

function cellValue(context: SheetContext, ref: string): number {
  const key = ref.trim().toUpperCase();
  const cached = context.cache.get(key);
  if (cached !== undefined) return cached;
  if (context.visiting.has(key)) throw syntaxError("Circular reference");
  context.visiting.add(key);
  try {
    const raw = context.cells[key];
    let value = 0;
    if (raw !== undefined && raw.trim() !== "") {
      const text = raw.trim();
      value = text.startsWith("=")
        ? evaluateFormula(context, text.slice(1))
        : Number(text);
      if (Number.isNaN(value)) value = 0;
    }
    context.cache.set(key, value);
    return value;
  } finally {
    context.visiting.delete(key);
  }
}

const FUNCTIONS: Record<string, (values: number[]) => number> = {
  SUM: (values) => values.reduce((a, b) => a + b, 0),
  AVERAGE: (values) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
  MIN: (values) => (values.length ? Math.min(...values) : 0),
  MAX: (values) => (values.length ? Math.max(...values) : 0),
  COUNT: (values) => values.length,
};

class FormulaParser {
  private pos = 0;

  constructor(
    private readonly source: string,
    private readonly context: SheetContext,
  ) {}

  parse(): number {
    const value = this.parseExpression();
    this.skipSpaces();
    if (this.pos < this.source.length)
      throw syntaxError("Unexpected token in formula");
    return value;
  }

  private skipSpaces(): void {
    while (this.source[this.pos] === " ") this.pos += 1;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    for (;;) {
      this.skipSpaces();
      const char = this.source[this.pos];
      if (char === "+" || char === "-") {
        this.pos += 1;
        const rhs = this.parseTerm();
        value = char === "+" ? value + rhs : value - rhs;
      } else {
        return value;
      }
    }
  }

  private parseTerm(): number {
    let value = this.parsePower();
    for (;;) {
      this.skipSpaces();
      const char = this.source[this.pos];
      if (char === "*" || char === "/") {
        this.pos += 1;
        const rhs = this.parsePower();
        value = char === "*" ? value * rhs : value / rhs;
      } else {
        return value;
      }
    }
  }

  private parsePower(): number {
    const base = this.parseUnary();
    this.skipSpaces();
    if (this.source[this.pos] === "^") {
      this.pos += 1;
      const exponent = this.parsePower();
      return base ** exponent;
    }
    return base;
  }

  private parseUnary(): number {
    this.skipSpaces();
    const char = this.source[this.pos];
    if (char === "-") {
      this.pos += 1;
      return -this.parseUnary();
    }
    if (char === "+") {
      this.pos += 1;
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    this.skipSpaces();
    const char = this.source[this.pos];

    if (char === "(") {
      this.pos += 1;
      const value = this.parseExpression();
      this.skipSpaces();
      if (this.source[this.pos] !== ")")
        throw syntaxError("Missing closing parenthesis");
      this.pos += 1;
      return value;
    }

    if (char !== undefined && /[0-9.]/.test(char)) {
      let text = "";
      while (
        this.pos < this.source.length &&
        /[0-9.]/.test(this.source[this.pos]!)
      ) {
        text += this.source[this.pos];
        this.pos += 1;
      }
      const value = Number(text);
      if (Number.isNaN(value)) throw syntaxError(`Invalid number ${text}`);
      return value;
    }

    if (char !== undefined && /[A-Za-z]/.test(char)) {
      let letters = "";
      while (
        this.pos < this.source.length &&
        /[A-Za-z]/.test(this.source[this.pos]!)
      ) {
        letters += this.source[this.pos];
        this.pos += 1;
      }
      this.skipSpaces();
      if (this.source[this.pos] === "(") {
        return this.parseFunction(letters.toUpperCase());
      }
      while (
        this.pos < this.source.length &&
        /[0-9]/.test(this.source[this.pos]!)
      ) {
        letters += this.source[this.pos];
        this.pos += 1;
      }
      return cellValue(this.context, letters);
    }

    throw syntaxError("Unexpected end of formula");
  }

  private parseFunction(name: string): number {
    this.pos += 1; // consume '('
    const args: number[] = [];
    this.skipSpaces();
    if (this.source[this.pos] !== ")") {
      for (;;) {
        args.push(...this.parseArgument());
        this.skipSpaces();
        if (this.source[this.pos] === ",") {
          this.pos += 1;
          continue;
        }
        break;
      }
    }
    this.skipSpaces();
    if (this.source[this.pos] !== ")")
      throw syntaxError("Missing closing parenthesis");
    this.pos += 1;

    if (name === "ABS") return Math.abs(args[0] ?? 0);
    if (name === "SQRT") return Math.sqrt(args[0] ?? 0);
    if (name === "ROUND") return Math.round(args[0] ?? 0);
    const fn = FUNCTIONS[name];
    if (!fn) throw argumentError(`Unknown function ${name}`);
    return fn(args);
  }

  private parseArgument(): number[] {
    this.skipSpaces();
    const start = this.pos;
    // Look ahead for a range of the form A1:B4
    const match = /^([A-Za-z]+[0-9]+)\s*:\s*([A-Za-z]+[0-9]+)/.exec(
      this.source.slice(this.pos),
    );
    if (match) {
      this.pos += match[0].length;
      return expandRange(match[1]!, match[2]!).map((ref) =>
        cellValue(this.context, ref),
      );
    }
    this.pos = start;
    return [this.parseExpression()];
  }
}

export function evaluateFormula(
  context: SheetContext,
  formula: string,
): number {
  return new FormulaParser(formula, context).parse();
}

export interface SheetResult {
  values: Record<string, number>;
  errors: Record<string, string>;
}

/** Evaluate every cell in the sheet, reporting per-cell errors instead of throwing. */
export function evaluateSheet(cells: Cells): SheetResult {
  const context: SheetContext = {
    cells,
    cache: new Map(),
    visiting: new Set(),
  };
  const values: Record<string, number> = {};
  const errors: Record<string, string> = {};

  for (const key of Object.keys(cells)) {
    try {
      values[key] = cellValue(context, key);
    } catch (error) {
      errors[key] = error instanceof Error ? error.message : "Error";
    }
  }
  return { values, errors };
}
