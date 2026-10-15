import { argumentError, domainError } from "@/lib/engine";
import type { NumberBase } from "@/lib/engine/types";

export type LogicOperator =
  "and" | "or" | "xor" | "xnor" | "not" | "neg" | "shl" | "shr";
export type ArithmeticOperator = "+" | "-" | "*" | "/";
export type BaseNOperator = LogicOperator | ArithmeticOperator;

export const BASE_DIGITS: Record<NumberBase, string> = {
  2: "01",
  8: "01234567",
  10: "0123456789",
  16: "0123456789ABCDEF",
};

/** Parse a string in the given base into a JavaScript number. */
export function parseInBase(text: string, base: NumberBase): number {
  const trimmed = text.trim().toUpperCase();
  if (trimmed === "") throw argumentError("Empty value");
  const sign = trimmed.startsWith("-") ? -1 : 1;
  const body = trimmed.replace(/^[-+]/, "");
  const digits = BASE_DIGITS[base];
  for (const char of body) {
    if (!digits.includes(char))
      throw domainError(`Digit ${char} is not valid in base ${base}`);
  }
  const value = parseInt(body, base);
  if (Number.isNaN(value)) throw argumentError("Invalid number");
  return sign * value;
}

/** Format a number in the given base, using two's complement for negatives (32-bit word). */
export function formatInBase(value: number, base: NumberBase): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.trunc(value);
  const word = rounded < 0 ? rounded >>> 0 : rounded;
  return word.toString(base).toUpperCase();
}

export function toSigned32(value: number): number {
  return value | 0;
}

export function toUnsigned32(value: number): number {
  return value >>> 0;
}

/** Apply a base-N operation to two operands, staying inside the 32-bit word. */
export function applyOperation(
  a: number,
  b: number,
  operator: BaseNOperator,
): number {
  const x = toSigned32(a);
  const y = toSigned32(b);
  switch (operator) {
    case "+":
      return toSigned32(x + y);
    case "-":
      return toSigned32(x - y);
    case "*":
      return toSigned32(Math.imul(x, y));
    case "/":
      if (y === 0) throw domainError("Division by zero");
      return Math.trunc(x / y);
    case "and":
      return toSigned32(x & y);
    case "or":
      return toSigned32(x | y);
    case "xor":
      return toSigned32(x ^ y);
    case "xnor":
      return toSigned32(~(x ^ y));
    case "not":
      return toSigned32(~x);
    case "neg":
      return toSigned32(-x);
    case "shl":
      return toSigned32(x << y);
    case "shr":
      return toSigned32(x >> y);
    default:
      throw argumentError("Unsupported operator");
  }
}

export function isUnaryOperator(operator: BaseNOperator): boolean {
  return operator === "not" || operator === "neg";
}

export interface BaseRepresentations {
  DEC: string;
  HEX: string;
  OCT: string;
  BIN: string;
}

export function representations(value: number): BaseRepresentations {
  return {
    DEC: formatInBase(value, 10),
    HEX: formatInBase(value, 16),
    OCT: formatInBase(value, 8),
    BIN: formatInBase(value, 2),
  };
}
