import { dimensionError, mathError } from "@/lib/engine";

export type Matrix = number[][];

export function createMatrix(rows: number, cols: number, fill = 0): Matrix {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => fill),
  );
}

export function isSquare(a: Matrix): boolean {
  return a.length > 0 && a.every((row) => row.length === a.length);
}

export function sameShape(a: Matrix, b: Matrix): boolean {
  return (
    a.length === b.length &&
    a.every((row, index) => row.length === b[index]?.length)
  );
}

function checkSameShape(a: Matrix, b: Matrix): void {
  if (!sameShape(a, b)) throw dimensionError("Matrix dimensions do not match");
}

export function matAdd(a: Matrix, b: Matrix): Matrix {
  checkSameShape(a, b);
  return a.map((row, i) => row.map((value, j) => value + (b[i]![j] ?? 0)));
}

export function matSub(a: Matrix, b: Matrix): Matrix {
  checkSameShape(a, b);
  return a.map((row, i) => row.map((value, j) => value - (b[i]![j] ?? 0)));
}

export function matMul(a: Matrix, b: Matrix): Matrix {
  const rows = a.length;
  const inner = a[0]?.length ?? 0;
  const cols = b[0]?.length ?? 0;
  if (b.length !== inner)
    throw dimensionError(
      "Matrix dimensions are incompatible for multiplication",
    );
  const result = createMatrix(rows, cols);
  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < inner; k += 1) {
      const aik = a[i]![k]!;
      if (aik === 0) continue;
      for (let j = 0; j < cols; j += 1) {
        result[i]![j] += aik * (b[k]![j] ?? 0);
      }
    }
  }
  return result;
}

export function matTranspose(a: Matrix): Matrix {
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  const result = createMatrix(cols, rows);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      result[j]![i] = a[i]![j]!;
    }
  }
  return result;
}

export function identity(n: number): Matrix {
  const result = createMatrix(n, n);
  for (let i = 0; i < n; i += 1) result[i]![i] = 1;
  return result;
}

/** Determinant via LU decomposition with partial pivoting. */
export function determinant(a: Matrix): number {
  if (!isSquare(a))
    throw dimensionError("Determinant requires a square matrix");
  const n = a.length;
  const m = a.map((row) => [...row]);
  let det = 1;

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(m[row]![col]!) > Math.abs(m[pivot]![col]!)) pivot = row;
    }
    if (Math.abs(m[pivot]![col]!) < 1e-14) return 0;
    if (pivot !== col) {
      const tmp = m[pivot]!;
      m[pivot] = m[col]!;
      m[col] = tmp;
      det = -det;
    }
    det *= m[col]![col]!;
    for (let row = col + 1; row < n; row += 1) {
      const factor = m[row]![col]! / m[col]![col]!;
      for (let k = col; k < n; k += 1)
        m[row]![k] = m[row]![k]! - factor * m[col]![k]!;
    }
  }
  return det;
}

/** Inverse via Gauss–Jordan elimination. */
export function inverse(a: Matrix): Matrix {
  if (!isSquare(a)) throw dimensionError("Inverse requires a square matrix");
  const n = a.length;
  const m = a.map((row, i) => [...row, ...identity(n)[i]!]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(m[row]![col]!) > Math.abs(m[pivot]![col]!)) pivot = row;
    }
    if (Math.abs(m[pivot]![col]!) < 1e-12)
      throw mathError("Matrix is singular and has no inverse");
    if (pivot !== col) {
      const tmp = m[pivot]!;
      m[pivot] = m[col]!;
      m[col] = tmp;
    }
    const pivotValue = m[col]![col]!;
    for (let k = 0; k < 2 * n; k += 1) m[col]![k] = m[col]![k]! / pivotValue;

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = m[row]![col]!;
      for (let k = 0; k < 2 * n; k += 1)
        m[row]![k] = m[row]![k]! - factor * m[col]![k]!;
    }
  }

  return m.map((row) => row.slice(n));
}

export function matScale(a: Matrix, factor: number): Matrix {
  return a.map((row) => row.map((value) => value * factor));
}

export function shapeText(a: Matrix): string {
  return `${a.length}×${a[0]?.length ?? 0}`;
}

export function formatMatrix(
  a: Matrix,
  format: (value: number) => string,
): string[][] {
  return a.map((row) => row.map((value) => format(value)));
}
