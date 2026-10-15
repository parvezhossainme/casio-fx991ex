import { dimensionError, mathError } from "@/lib/engine";
import {
  cabs,
  cadd,
  cdiv,
  cmul,
  csub,
  cleanComplex,
  isReal,
  type Cx,
} from "./complex";

/** Solve a simultaneous linear system A·x = b with Gaussian elimination and partial pivoting. */
export function solveLinearSystem(a: number[][], b: number[]): number[] {
  const n = a.length;
  if (n === 0 || a.some((row) => row.length !== n) || b.length !== n) {
    throw dimensionError("Coefficient matrix must be square");
  }

  const m = a.map((row, index) => [...row, b[index] ?? 0]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(m[row]![col]!) > Math.abs(m[pivot]![col]!)) pivot = row;
    }
    if (Math.abs(m[pivot]![col]!) < 1e-12)
      throw mathError("No unique solution exists");
    if (pivot !== col) {
      const tmp = m[pivot]!;
      m[pivot] = m[col]!;
      m[col] = tmp;
    }
    const pivotRow = m[col]!;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = m[row]![col]! / pivotRow[col]!;
      for (let k = col; k <= n; k += 1) {
        m[row]![k] = m[row]![k]! - factor * pivotRow[k]!;
      }
    }
  }

  return m.map((row, index) => row[n]! / row[index]!);
}

/**
 * Find all roots of a polynomial with real coefficients (highest power first) using the
 * Durand–Kerner iteration, which returns complex roots directly.
 */
export function polynomialRoots(coefficients: number[]): Cx[] {
  const coeffs = coefficients.map((c) => c);
  while (coeffs.length > 1 && Math.abs(coeffs[0]!) < 1e-14) coeffs.shift();
  const degree = coeffs.length - 1;

  if (degree < 1) throw mathError("Not a valid polynomial equation");
  const leading = coeffs[0]!;
  const normalized = coeffs.map((c) => c / leading);
  const c0 = normalized[degree]!;
  if (Math.abs(c0) < 1e-15) {
    // x = 0 is a root; evaluate the deflated polynomial for the rest.
    const deflated = normalized.slice(0, degree);
    return [{ re: 0, im: 0 }, ...polynomialRoots(deflated)];
  }

  let roots: Cx[] = Array.from({ length: degree }, (_, index) => {
    const angle = (2 * Math.PI * index) / degree + 0.4;
    return { re: Math.cos(angle) * 1.2, im: Math.sin(angle) * 1.2 };
  });

  for (let iteration = 0; iteration < 500; iteration += 1) {
    let maxDelta = 0;
    const next: Cx[] = [];
    for (let i = 0; i < degree; i += 1) {
      const root = roots[i]!;
      const numerator = evaluateComplex(normalized, root);
      let denominator: Cx = { re: 1, im: 0 };
      for (let j = 0; j < degree; j += 1) {
        if (j === i) continue;
        denominator = cmul(denominator, csub(root, roots[j]!));
      }
      const delta = cdiv(numerator, denominator);
      const updated = csub(root, delta);
      maxDelta = Math.max(maxDelta, cabs(delta));
      next.push(updated);
    }
    roots = next;
    if (maxDelta < 1e-14) break;
  }

  return roots
    .map((root) => cleanComplex(root, 1e-8))
    .sort((p, q) => p.re - q.re || p.im - q.im);
}

function evaluateComplex(coefficients: number[], x: Cx): Cx {
  let result: Cx = { re: 0, im: 0 };
  for (const coefficient of coefficients) {
    result = cadd(cmul(result, x), { re: coefficient, im: 0 });
  }
  return result;
}

export interface PolynomialSolution {
  degree: number;
  roots: Cx[];
}

export function solvePolynomial(coefficients: number[]): PolynomialSolution {
  const roots = polynomialRoots(coefficients);
  return { degree: degreeOf(coefficients), roots };
}

export function degreeOf(coefficients: number[]): number {
  const coeffs = [...coefficients];
  while (coeffs.length > 1 && Math.abs(coeffs[0]!) < 1e-14) coeffs.shift();
  return coeffs.length - 1;
}

export function realRoots(roots: Cx[]): number[] {
  return roots
    .filter((root) => isReal(root))
    .map((root) => root.re)
    .sort((a, b) => a - b);
}
