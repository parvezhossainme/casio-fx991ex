import { argumentError, mathError } from "@/lib/engine";

const MAX_EXPANDED = 1_000_000;

function expand(values: number[], frequencies?: number[]): number[] {
  if (!frequencies || frequencies.length === 0) return [...values];
  if (frequencies.length !== values.length)
    throw argumentError("Frequency list length mismatch");
  const out: number[] = [];
  values.forEach((value, index) => {
    const count = Math.round(frequencies[index] ?? 1);
    if (count < 0) throw argumentError("Frequencies must be non-negative");
    if (out.length + count > MAX_EXPANDED)
      throw mathError("Too many data points");
    for (let i = 0; i < count; i += 1) out.push(value);
  });
  return out;
}

function medianOf(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Median-based quartiles, matching the device's default statistic type. */
function quartiles(sorted: number[]): { q1: number; q3: number } {
  const n = sorted.length;
  if (n === 0) return { q1: NaN, q3: NaN };
  const mid = Math.floor(n / 2);
  const lower = sorted.slice(0, mid);
  const upper = n % 2 === 1 ? sorted.slice(mid + 1) : sorted.slice(mid);
  return { q1: medianOf(lower), q3: medianOf(upper) };
}

export interface OneVariableStats {
  n: number;
  sum: number;
  sumSquares: number;
  mean: number;
  populationStdDev: number;
  sampleStdDev: number;
  median: number;
  q1: number;
  q3: number;
  min: number;
  max: number;
}

export function oneVariableStats(
  values: number[],
  frequencies?: number[],
): OneVariableStats {
  const data = expand(values, frequencies).sort((a, b) => a - b);
  if (data.length === 0) throw mathError("No data points");

  const n = data.length;
  const sum = data.reduce((acc, value) => acc + value, 0);
  const sumSquares = data.reduce((acc, value) => acc + value * value, 0);
  const mean = sum / n;
  const variance = sumSquares / n - mean * mean;
  const sampleVariance = n > 1 ? (sumSquares - n * mean * mean) / (n - 1) : 0;
  const { q1, q3 } = quartiles(data);

  return {
    n,
    sum,
    sumSquares,
    mean,
    populationStdDev: Math.sqrt(Math.max(0, variance)),
    sampleStdDev: Math.sqrt(Math.max(0, sampleVariance)),
    median: medianOf(data),
    q1,
    q3,
    min: data[0]!,
    max: data[n - 1]!,
  };
}

export interface LinearRegression {
  a: number;
  b: number;
  r: number;
}

interface Pair {
  x: number;
  y: number;
}

function pairs(x: number[], y: number[], frequencies?: number[]): Pair[] {
  if (x.length !== y.length)
    throw argumentError("x and y must have the same number of entries");
  const out: Pair[] = [];
  x.forEach((xv, index) => {
    const yv = y[index]!;
    const count = frequencies ? Math.round(frequencies[index] ?? 1) : 1;
    if (out.length + count > MAX_EXPANDED)
      throw mathError("Too many data points");
    for (let i = 0; i < count; i += 1) out.push({ x: xv, y: yv });
  });
  if (out.length < 2) throw mathError("At least two data points are required");
  return out;
}

/** Least-squares linear regression y = a + b·x, returning the correlation coefficient r. */
export function linearRegression(
  x: number[],
  y: number[],
  frequencies?: number[],
): LinearRegression {
  const data = pairs(x, y, frequencies);
  const n = data.length;
  const sumX = data.reduce((acc, p) => acc + p.x, 0);
  const sumY = data.reduce((acc, p) => acc + p.y, 0);
  const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = data.reduce((acc, p) => acc + p.x * p.x, 0);
  const sumYY = data.reduce((acc, p) => acc + p.y * p.y, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (Math.abs(denominator) < 1e-14)
    throw mathError("Regression is undefined for these data");

  const b = (n * sumXY - sumX * sumY) / denominator;
  const a = (sumY - b * sumX) / n;

  const rDenominator = Math.sqrt(
    (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY),
  );
  const r = rDenominator === 0 ? NaN : (n * sumXY - sumX * sumY) / rDenominator;

  return { a, b, r };
}

export function parseDataList(text: string): number[] {
  const parts = text
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.map((part) => {
    const value = Number(part);
    if (Number.isNaN(value)) throw argumentError(`"${part}" is not a number`);
    return value;
  });
}
