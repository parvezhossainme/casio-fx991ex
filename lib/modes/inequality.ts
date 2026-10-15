import { mathError } from "@/lib/engine";
import { polynomialRoots, realRoots } from "./equation";

export type InequalityOperator = ">" | ">=" | "<" | "<=";

export interface Interval {
  from: number;
  to: number;
  fromClosed: boolean;
  toClosed: boolean;
}

function evaluateAt(coefficients: number[], x: number): number {
  let result = 0;
  for (const coefficient of coefficients) result = result * x + coefficient;
  return result;
}

function satisfies(
  value: number,
  op: InequalityOperator,
  tolerance = 1e-12,
): boolean {
  switch (op) {
    case ">":
      return value > tolerance;
    case ">=":
      return value >= -tolerance;
    case "<":
      return value < -tolerance;
    case "<=":
      return value <= tolerance;
  }
}

function midpoint(from: number, to: number): number {
  if (!Number.isFinite(from)) return to - 1;
  if (!Number.isFinite(to)) return from + 1;
  return (from + to) / 2;
}

function uniqueRoots(roots: number[], tolerance = 1e-9): number[] {
  const out: number[] = [];
  for (const root of roots) {
    if (!out.some((existing) => Math.abs(existing - root) <= tolerance))
      out.push(root);
  }
  return out.sort((a, b) => a - b);
}

/** Solve a polynomial inequality (`coefficients` highest power first) and return solution intervals. */
export function solvePolynomialInequality(
  coefficients: number[],
  op: InequalityOperator,
): Interval[] {
  const degree = coefficients.length - 1;
  if (degree < 1) throw mathError("Inequality must be at least linear");

  const strict = op === ">" || op === "<";
  const roots = uniqueRoots(realRoots(polynomialRoots(coefficients)));

  if (roots.length === 0) {
    const value = evaluateAt(coefficients, 0);
    return satisfies(value, op)
      ? [{ from: -Infinity, to: Infinity, fromClosed: false, toClosed: false }]
      : [];
  }

  const breaks = [-Infinity, ...roots, Infinity];
  const satisfied: boolean[] = [];
  for (let i = 0; i < breaks.length - 1; i += 1) {
    const value = evaluateAt(
      coefficients,
      midpoint(breaks[i]!, breaks[i + 1]!),
    );
    satisfied.push(satisfies(value, op));
  }

  const intervals: Interval[] = [];
  if (strict) {
    for (let i = 0; i < satisfied.length; i += 1) {
      if (satisfied[i]) {
        intervals.push({
          from: breaks[i]!,
          to: breaks[i + 1]!,
          fromClosed: false,
          toClosed: false,
        });
      }
    }
  } else {
    let i = 0;
    while (i < satisfied.length) {
      if (!satisfied[i]) {
        i += 1;
        continue;
      }
      let j = i;
      while (j + 1 < satisfied.length && satisfied[j + 1]) j += 1;
      intervals.push({
        from: breaks[i]!,
        to: breaks[j + 1]!,
        fromClosed: Number.isFinite(breaks[i]!),
        toClosed: Number.isFinite(breaks[j + 1]!),
      });
      i = j + 1;
    }
  }

  return intervals;
}

function number(value: number): string {
  const rounded = Math.abs(value) < 1e-10 ? 0 : value;
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(Number(rounded.toFixed(10)));
}

export function formatInterval(interval: Interval): string {
  const { from, to, fromClosed, toClosed } = interval;
  if (!Number.isFinite(from) && !Number.isFinite(to)) return "all real numbers";
  if (!Number.isFinite(from)) return `x ${toClosed ? "≤" : "<"} ${number(to)}`;
  if (!Number.isFinite(to))
    return `x ${fromClosed ? "≥" : ">"} ${number(from)}`;
  const left = `${number(from)} ${fromClosed ? "≤" : "<"}`;
  const right = `${toClosed ? "≤" : "<"} ${number(to)}`;
  return `${left} x ${right}`;
}

export function formatIntervals(intervals: Interval[]): string {
  if (intervals.length === 0) return "no solution";
  return intervals.map(formatInterval).join("  or  ");
}
