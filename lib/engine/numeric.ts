import { mathError } from "./errors";

/**
 * Numerical routines used by CALC/∫/d-dx/Σ/SOLVE.
 * Integration uses adaptive Gauss–Kronrod (G7–K15); 24-point rule with an embedded
 * 7-point Gauss estimate for the error term.
 */

const KRONROD_X = [
  0.9914553711208126, 0.9491079123427585, 0.8648644233597691,
  0.7415311855993945, 0.5860872354676911, 0.4058451513773972,
  0.2077849550078985, 0,
];

const KRONROD_W = [
  0.0229353220105292, 0.0630920926299786, 0.1047900103222502,
  0.1406532597155259, 0.1690047266392679, 0.1903505780647854,
  0.2044329400752989, 0.2094821410847278,
];

/** Gauss 7-point weights for the subset of Kronrod nodes that coincide with Gauss nodes. */
const GAUSS_W = [
  0.1294849661688697, 0.2797053914892766, 0.3818300505051189,
  0.4179591836734694,
];
const GAUSS_NODE_INDICES = [1, 3, 5, 7];

export type RealFunction = (x: number) => number;

function assertFinite(value: number, what: string): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    throw mathError(`${what} could not be evaluated`);
  }
  return value;
}

export interface IntegrateOptions {
  tolerance?: number;
  maxDepth?: number;
}

/** Adaptive Gauss–Kronrod quadrature of `f` on [a, b]. */
export function integrate(
  f: RealFunction,
  a: number,
  b: number,
  options: IntegrateOptions = {},
): number {
  const tolerance = options.tolerance ?? 1e-10;
  const maxDepth = options.maxDepth ?? 50;

  if (a === b) return 0;

  const quad = (lo: number, hi: number): { value: number; error: number } => {
    const center = (lo + hi) / 2;
    const half = (hi - lo) / 2;

    let k = 0;
    for (let i = 0; i < KRONROD_X.length; i += 1) {
      const x = KRONROD_X[i]!;
      const w = KRONROD_W[i]!;
      if (x === 0) {
        k += w * f(center);
      } else {
        k += w * (f(center - half * x) + f(center + half * x));
      }
    }

    let g = 0;
    for (let j = 0; j < GAUSS_NODE_INDICES.length; j += 1) {
      const idx = GAUSS_NODE_INDICES[j]!;
      const x = KRONROD_X[idx]!;
      const w = GAUSS_W[j]!;
      if (x === 0) {
        g += w * f(center);
      } else {
        g += w * (f(center - half * x) + f(center + half * x));
      }
    }

    return { value: half * k, error: Math.abs(half * (k - g)) };
  };

  const recurse = (
    lo: number,
    hi: number,
    whole: { value: number; error: number },
    depth: number,
  ): number => {
    if (
      depth >= maxDepth ||
      whole.error <= tolerance * Math.max(1, Math.abs(whole.value))
    ) {
      return whole.value;
    }
    const mid = (lo + hi) / 2;
    const left = quad(lo, mid);
    const right = quad(mid, hi);
    return (
      recurse(lo, mid, left, depth + 1) + recurse(mid, hi, right, depth + 1)
    );
  };

  const result = recurse(a, b, quad(a, b), 0);
  return assertFinite(result, "Integral");
}

/** Five-point central-difference derivative. */
export function derivative(f: RealFunction, x: number, h?: number): number {
  const step = h ?? Math.max(1e-5, 1e-5 * Math.abs(x));
  const result =
    (-f(x + 2 * step) + 8 * f(x + step) - 8 * f(x - step) + f(x - 2 * step)) /
    (12 * step);
  return assertFinite(result, "Derivative");
}

export interface SummationOptions {
  step?: number;
  maxTerms?: number;
}

/** Σ f(x) for x = lower, lower+step, … upper. */
export function summation(
  f: RealFunction,
  lower: number,
  upper: number,
  options: SummationOptions = {},
): number {
  const step = options.step ?? 1;
  if (step === 0) throw mathError("Summation step cannot be zero");
  const maxTerms = options.maxTerms ?? 100_000;

  let total = 0;
  let count = 0;
  if (step > 0) {
    for (let x = lower; x <= upper + 1e-12; x += step) {
      total += f(x);
      if ((count += 1) > maxTerms)
        throw mathError("Summation has too many terms");
    }
  } else {
    for (let x = lower; x >= upper - 1e-12; x += step) {
      total += f(x);
      if ((count += 1) > maxTerms)
        throw mathError("Summation has too many terms");
    }
  }
  return assertFinite(total, "Summation");
}

export interface SolveOptions {
  tolerance?: number;
  maxIterations?: number;
  lower?: number;
  upper?: number;
}

/**
 * Find a root of `f` near a starting guess. Uses Newton's method with a numeric derivative and
 * falls back to bisection on a scanning bracket, which is far more forgiving than Newton alone.
 */
export function solve(
  f: RealFunction,
  guess = 0,
  options: SolveOptions = {},
): number {
  const tolerance = options.tolerance ?? 1e-12;
  const maxIterations = options.maxIterations ?? 100;

  let x = guess;
  for (let i = 0; i < maxIterations; i += 1) {
    const fx = f(x);
    if (!Number.isFinite(fx)) break;
    if (Math.abs(fx) < tolerance) return x;
    const dfx = derivative(f, x);
    if (!Number.isFinite(dfx) || dfx === 0) break;
    const next = x - fx / dfx;
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - x) < tolerance) return next;
    x = next;
  }

  // Bracket scan fallback.
  const lower = options.lower ?? guess - 100;
  const upper = options.upper ?? guess + 100;
  const steps = 1000;
  const step = (upper - lower) / steps;
  let prevX = lower;
  let prevF = f(prevX);
  for (let i = 1; i <= steps; i += 1) {
    const curX = lower + i * step;
    const curF = f(curX);
    if (Number.isFinite(prevF) && Number.isFinite(curF) && prevF === 0)
      return prevX;
    if (Number.isFinite(prevF) && Number.isFinite(curF) && prevF * curF < 0) {
      let lo = prevX;
      let hi = curX;
      let flo = prevF;
      for (let k = 0; k < 200; k += 1) {
        const mid = (lo + hi) / 2;
        const fmid = f(mid);
        if (!Number.isFinite(fmid)) break;
        if (Math.abs(fmid) < tolerance || (hi - lo) / 2 < tolerance) return mid;
        if (flo * fmid < 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fmid;
        }
      }
      return (lo + hi) / 2;
    }
    prevX = curX;
    prevF = curF;
  }

  throw mathError("SOLVE could not find a solution");
}
