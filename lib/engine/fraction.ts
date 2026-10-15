/** Exact-form helpers: rational reconstruction, mixed numbers, π-multiples and simple surds. */

export interface Fraction {
  n: number;
  d: number;
}

/** Continued-fraction reconstruction of a decimal into a small rational. */
export function decimalToFraction(
  value: number,
  tolerance = 1e-10,
  maxDenominator = 1e9,
): Fraction | null {
  if (!Number.isFinite(value)) return null;
  if (Number.isInteger(value)) return { n: value, d: 1 };

  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);

  let h0 = 0;
  let h1 = 1;
  let k0 = 1;
  let k1 = 0;
  let b = x;

  for (let i = 0; i < 60; i += 1) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    h0 = h1;
    h1 = h2;
    k0 = k1;
    k1 = k2;

    if (k1 > maxDenominator) return null;
    if (k1 !== 0 && Math.abs(x - h1 / k1) <= tolerance * Math.max(1, x)) {
      return { n: sign * h1, d: k1 };
    }
    const remainder = b - a;
    if (remainder < 1e-13) break;
    b = 1 / remainder;
  }
  return null;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function simplify(f: Fraction): Fraction {
  const g = gcd(f.n, f.d) || 1;
  return { n: f.n / g, d: f.d / g };
}

export interface MixedNumber {
  sign: -1 | 1;
  whole: number;
  n: number;
  d: number;
}

export function toMixed(f: Fraction): MixedNumber {
  const s = simplify(f);
  const sign: -1 | 1 = s.n < 0 ? -1 : 1;
  const absN = Math.abs(s.n);
  return { sign, whole: Math.floor(absN / s.d), n: absN % s.d, d: s.d };
}

export function fractionText(f: Fraction, mixed = false): string {
  const s = simplify(f);
  if (s.d === 1) return String(s.n);
  if (!mixed) return `${s.n}/${s.d}`;
  const m = toMixed(s);
  const body =
    m.whole === 0
      ? `${m.n}/${m.d}`
      : m.n === 0
        ? String(m.whole)
        : `${m.whole} ${m.n}/${m.d}`;
  return m.sign === -1 ? `-${body}` : body;
}

const PI_DENOMINATORS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12];

/** Express a value as a small rational multiple of π, e.g. 1.5707963 → "π/2". */
export function asPiMultiple(value: number): string | null {
  if (value === 0) return null;
  const ratio = value / Math.PI;
  const f = decimalToFraction(ratio, 1e-10, 144);
  if (!f) return null;
  if (!PI_DENOMINATORS.includes(f.d) || Math.abs(f.n) > 24) return null;

  const num = f.n;
  const den = f.d;
  const sign = num < 0 ? "-" : "";
  const absNum = Math.abs(num);

  let numerator: string;
  if (absNum === 1) numerator = "π";
  else numerator = `${absNum}π`;

  if (den === 1) return `${sign}${numerator}`;
  return `${sign}${numerator}/${den}`;
}

/** Express a value as a small surd a√b/c, e.g. 1.4142135 → "√2". */
export function asSurd(value: number): string | null {
  if (!Number.isFinite(value) || value === 0) return null;
  const negative = value < 0;
  const v = Math.abs(value);

  for (let c = 1; c <= 12; c += 1) {
    for (let a = 1; a <= 12; a += 1) {
      const target = (v * c) / a;
      const bi = Math.round(target * target);
      if (bi < 1 || bi > 400) continue;
      const approx = (a * Math.sqrt(bi)) / c;
      if (Math.abs(approx - v) <= 1e-10 * Math.max(1, v)) {
        const text = formatSurd(a, bi, c);
        return negative ? `-${text}` : text;
      }
    }
  }
  return null;
}

function formatSurd(a: number, b: number, c: number): string {
  // Reconstruct a·√b / c in lowest terms, pulling perfect squares out of the radicand.
  const { outside, inside } = simplifyRadicand(b);
  const coefficient = a * outside;

  const g = gcd(coefficient, c) || 1;
  const numerator = coefficient / g;
  const denominator = c / g;

  if (inside === 1) {
    return denominator === 1
      ? String(numerator)
      : `${numerator}/${denominator}`;
  }

  const radical = `${numerator === 1 ? "" : numerator}√${inside}`;
  return denominator === 1 ? radical : `${radical}/${denominator}`;
}

/** Pull perfect-square factors out of a radicand: 12 → 2√3. */
export function simplifyRadicand(b: number): {
  outside: number;
  inside: number;
} {
  let outside = 1;
  let inside = b;
  for (let i = 2; i * i <= inside; i += 1) {
    while (inside % (i * i) === 0) {
      inside /= i * i;
      outside *= i;
    }
  }
  return { outside, inside };
}

export interface ExactForms {
  fraction: string | null;
  pi: string | null;
  surd: string | null;
}

/** All exact representations that closely match a decimal value. */
export function exactForms(value: number): ExactForms {
  const frac = decimalToFraction(value);
  return {
    fraction: frac ? fractionText(frac) : null,
    pi: asPiMultiple(value),
    surd: asSurd(value),
  };
}

/** True when the value is representable as an exact rational the device would display as a fraction. */
export function isExactFraction(value: number): boolean {
  const f = decimalToFraction(value);
  if (!f) return false;
  return f.d !== 1;
}
