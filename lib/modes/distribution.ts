import { argumentError, domainError } from "@/lib/engine";
import { math } from "@/lib/engine/evaluate";

const erf = (math as unknown as { erf: (value: number) => number }).erf.bind(
  math,
);

/** Lanczos approximation of ln Γ(x) for x > 0. */
export function logGamma(x: number): number {
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  const z = x - 1;
  let a = 0.99999999999980993;
  const t = z + 7.5;
  for (let i = 0; i < coefficients.length; i += 1) {
    a += coefficients[i]! / (z + i + 1);
  }
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a)
  );
}

function logCombination(n: number, k: number): number {
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  if (sigma <= 0) throw domainError("σ must be positive");
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** P(lower ≤ X ≤ upper) for a normal distribution. */
export function normalCdf(
  lower: number,
  upper: number,
  mu = 0,
  sigma = 1,
): number {
  if (sigma <= 0) throw domainError("σ must be positive");
  const zLower = (lower - mu) / (sigma * Math.SQRT2);
  const zUpper = (upper - mu) / (sigma * Math.SQRT2);
  return 0.5 * (erf(zUpper) - erf(zLower));
}

export function inverseNormal(p: number, mu = 0, sigma = 1): number {
  if (p <= 0 || p >= 1)
    throw domainError("Probability must be between 0 and 1");
  let low = mu - 40 * sigma;
  let high = mu + 40 * sigma;
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    if (normalCdf(-Infinity, mid, mu, sigma) < p) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function binomialPdf(k: number, n: number, p: number): number {
  if (n < 0 || !Number.isInteger(n) || k < 0 || k > n) return 0;
  if (p < 0 || p > 1) throw domainError("p must be between 0 and 1");
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logProb =
    logCombination(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logProb);
}

export function binomialCdf(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let total = 0;
  for (let i = 0; i <= k; i += 1) total += binomialPdf(i, n, p);
  return Math.min(1, total);
}

export function poissonPdf(k: number, lambda: number): number {
  if (lambda <= 0) throw domainError("λ must be positive");
  if (k < 0 || !Number.isInteger(k)) return 0;
  return Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1));
}

export function poissonCdf(k: number, lambda: number): number {
  if (k < 0) return 0;
  let total = 0;
  for (let i = 0; i <= Math.floor(k); i += 1) total += poissonPdf(i, lambda);
  return Math.min(1, total);
}

export function validateCount(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0)
    throw argumentError(`${name} must be a non-negative integer`);
}
