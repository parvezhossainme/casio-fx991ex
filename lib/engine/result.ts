import { type Complex } from "mathjs";
import { type DisplayFormat, formatNumber, DEFAULT_FORMAT } from "./format";
import { exactForms } from "./fraction";
import { type EvalResult } from "./evaluate";

export interface FormattedResult {
  /** Primary text shown on the result line. */
  text: string;
  /** Exact (fraction / π / surd) counterpart for S⇔D, when one exists and differs. */
  alternate: string | null;
}

function formatReal(value: number, format: DisplayFormat): string {
  return formatNumber(value, format).text;
}

/** Complex numbers are shown as `a+bi`, with `i` alone when the coefficient is ±1. */
export function formatComplex(
  value: Complex,
  format: DisplayFormat = DEFAULT_FORMAT,
): string {
  const re = Number(value.re);
  const im = Number(value.im);
  const reText = formatReal(re, format);

  const imaginaryCoefficient =
    Math.abs(im) === 1 ? "" : formatReal(Math.abs(im), format);
  const sign = im < 0 ? "-" : "+";
  const imText = `${imaginaryCoefficient}i`;

  if (re === 0) return `${im < 0 ? "-" : ""}${imaginaryCoefficient}i`;
  if (im === 0) return reText;
  return `${reText}${sign}${imText}`;
}

export function formatResult(
  value: EvalResult,
  format: DisplayFormat = DEFAULT_FORMAT,
): FormattedResult {
  if (typeof value === "number") {
    const text = formatReal(value, format);
    const alternate = exactAlternate(value, text);
    return { text, alternate };
  }

  if (Array.isArray(value)) {
    const text = value.map((entry) => formatReal(entry, format)).join(", ");
    return { text, alternate: null };
  }

  return { text: formatComplex(value, format), alternate: null };
}

function exactAlternate(value: number, decimalText: string): string | null {
  if (!Number.isFinite(value) || Number.isInteger(value)) return null;
  const forms = exactForms(value);
  const candidate = forms.pi ?? forms.surd ?? forms.fraction;
  if (!candidate) return null;
  return candidate === decimalText ? null : candidate;
}
