import { mathError } from "./errors";

/** How results are rendered on the LCD. Mirrors the device's SETUP display options. */
export type DisplayFormat =
  | { mode: "norm"; which: 1 | 2 }
  | { mode: "fix"; digits: number }
  | { mode: "sci"; digits: number }
  | { mode: "eng" };

export const DEFAULT_FORMAT: DisplayFormat = { mode: "norm", which: 1 };

/**
 * The physical device shows a 10-digit mantissa. We keep full float precision internally and
 * apply this only for display.
 */
export const DISPLAY_SIGNIFICANT_DIGITS = 10;

export interface FormattedNumber {
  /** Mantissa text, e.g. "-1.2345". */
  mantissa: string;
  /** Power-of-ten exponent, or null when the value is shown in ordinary fixed notation. */
  exponent: number | null;
  /** Plain-text fallback, e.g. "1.2345×10¹²". */
  text: string;
}

const SUPERSCRIPT_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

export function toSuperscript(value: number | string): string {
  const s = String(value);
  let out = "";
  for (const ch of s) {
    if (ch === "-") out += "⁻";
    else if (ch === "+") out += "⁺";
    else if (ch >= "0" && ch <= "9") out += SUPERSCRIPT_DIGITS[Number(ch)];
    else out += ch;
  }
  return out;
}

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

function trimTrailingZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/0+$/, "").replace(/\.$/, "");
}

/** Split a value into a mantissa rounded to `sig` significant digits and its decimal exponent. */
function toSignificant(
  value: number,
  sig: number,
): { mantissa: number; exponent: number } {
  if (value === 0) return { mantissa: 0, exponent: 0 };
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  const rounded = Number(mantissa.toPrecision(sig));
  if (Math.abs(rounded) >= 10)
    return { mantissa: rounded / 10, exponent: exponent + 1 };
  return { mantissa: rounded, exponent };
}

export function exponentOf(value: number): number {
  if (value === 0) return 0;
  return Math.floor(Math.log10(Math.abs(value)));
}

/** Format a real number the way the calculator's display would. */
export function formatNumber(
  value: number,
  format: DisplayFormat = DEFAULT_FORMAT,
): FormattedNumber {
  if (Number.isNaN(value) || !Number.isFinite(value))
    throw mathError("Result is not a finite number");

  let x = value;
  if (Object.is(x, -0)) x = 0;

  const fixed = (decimals: number): FormattedNumber => {
    const s = trimTrailingZeros(x.toFixed(clamp(decimals, 0, 100)));
    return { mantissa: s, exponent: null, text: s };
  };

  const scientific = (sig: number, trim = false): FormattedNumber => {
    const digits = clamp(sig, 1, 10);
    if (x === 0) return { mantissa: "0", exponent: null, text: "0" };
    const { mantissa, exponent } = toSignificant(x, digits);
    const raw = mantissa.toFixed(Math.max(0, digits - 1));
    const m = trim ? trimTrailingZeros(raw) : raw;
    return {
      mantissa: m,
      exponent,
      text: `${m}×10${toSuperscript(exponent)}`,
    };
  };

  if (format.mode === "fix") return fixed(clamp(format.digits, 0, 9));
  if (format.mode === "sci") return scientific(format.digits);

  if (format.mode === "eng") {
    if (x === 0) return { mantissa: "0", exponent: null, text: "0" };
    const exp = exponentOf(x);
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = x / Math.pow(10, engExp);
    const decimals = clamp(
      DISPLAY_SIGNIFICANT_DIGITS - 1 - (exp - engExp),
      0,
      9,
    );
    const m = trimTrailingZeros(mantissa.toFixed(decimals));
    if (engExp === 0) return { mantissa: m, exponent: null, text: m };
    return {
      mantissa: m,
      exponent: engExp,
      text: `${m}×10${toSuperscript(engExp)}`,
    };
  }

  const exp = exponentOf(x);
  const useExponential =
    x !== 0 && (exp > 9 || (format.which === 1 ? exp < -9 : exp < -3));
  if (useExponential) return scientific(DISPLAY_SIGNIFICANT_DIGITS, true);
  const decimals = clamp(DISPLAY_SIGNIFICANT_DIGITS - 1 - exp, 0, 100);
  return fixed(decimals);
}

export function formatNumberText(
  value: number,
  format?: DisplayFormat,
): string {
  return formatNumber(value, format).text;
}

/** Human-readable label for a display format (shown in the SETUP indicator area). */
export function formatLabel(format: DisplayFormat): string {
  switch (format.mode) {
    case "norm":
      return `Norm${format.which}`;
    case "fix":
      return `Fix ${format.digits}`;
    case "sci":
      return `Sci ${format.digits}`;
    case "eng":
      return "Eng";
  }
}

/**
 * Convert a decimal angle into the device's degrees/minutes/seconds notation, e.g. 1.5 → 1°30′0″.
 */
export function toDegreesMinutesSeconds(
  value: number,
  format: DisplayFormat = DEFAULT_FORMAT,
): string {
  if (!Number.isFinite(value)) throw mathError("Result is not a finite number");
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);

  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  let minutes = Math.floor(minutesFloat);
  let seconds = (minutesFloat - minutes) * 60;
  seconds = Number(seconds.toFixed(6));
  if (seconds >= 60) {
    seconds -= 60;
    minutes += 1;
  }
  let totalDegrees = degrees;
  if (minutes >= 60) {
    minutes -= 60;
    totalDegrees += 1;
  }

  return `${sign}${totalDegrees}°${minutes}′${formatNumber(seconds, format).mantissa}″`;
}
