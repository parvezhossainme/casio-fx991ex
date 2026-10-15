/** Minimal complex arithmetic used by the polynomial solver and complex mode helpers. */

export interface Cx {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Cx => ({ re, im });
export const cadd = (a: Cx, b: Cx): Cx => ({
  re: a.re + b.re,
  im: a.im + b.im,
});
export const csub = (a: Cx, b: Cx): Cx => ({
  re: a.re - b.re,
  im: a.im - b.im,
});
export const cmul = (a: Cx, b: Cx): Cx => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const cneg = (a: Cx): Cx => ({ re: -a.re, im: -a.im });
export const cabs = (a: Cx): number => Math.hypot(a.re, a.im);
export const cconj = (a: Cx): Cx => ({ re: a.re, im: -a.im });

export function cdiv(a: Cx, b: Cx): Cx {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) return { re: NaN, im: NaN };
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function csqrt(a: Cx): Cx {
  const r = cabs(a);
  const re = Math.sqrt(Math.max(0, (r + a.re) / 2));
  const im =
    Math.sign(a.im === 0 ? 1 : a.im) * Math.sqrt(Math.max(0, (r - a.re) / 2));
  return { re, im };
}

export function cis(theta: number): Cx {
  return { re: Math.cos(theta), im: Math.sin(theta) };
}

export function isReal(a: Cx, tolerance = 1e-9): boolean {
  return Math.abs(a.im) <= tolerance;
}

export function cleanComplex(a: Cx, tolerance = 1e-10): Cx {
  return {
    re: Math.abs(a.re) < tolerance ? 0 : a.re,
    im: Math.abs(a.im) < tolerance ? 0 : a.im,
  };
}
