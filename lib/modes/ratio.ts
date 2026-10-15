import { mathError } from "@/lib/engine";
import { gcd } from "@/lib/engine/fraction";

/** Reduce a ratio to its simplest integer form, scaling decimals up to whole numbers first. */
export function simplifyRatio(a: number, b: number): [number, number] {
  if (b === 0 && a === 0) throw mathError("Ratio terms cannot both be zero");
  if (!Number.isFinite(a) || !Number.isFinite(b))
    throw mathError("Ratio terms must be finite");

  let scale = 1;
  for (let power = 0; power <= 9; power += 1) {
    scale = 10 ** power;
    if (Number.isInteger(a * scale) && Number.isInteger(b * scale)) break;
  }

  const na = Math.round(a * scale);
  const nb = Math.round(b * scale);
  const g = gcd(na, nb) || 1;
  return [na / g, nb / g];
}

export function ratioText(a: number, b: number): string {
  const [x, y] = simplifyRatio(a, b);
  return `${x}:${y}`;
}

export type Proportion = [
  number | null,
  number | null,
  number | null,
  number | null,
];

/**
 * Solve a proportion `a : b = c : d` where exactly one of the four values is unknown.
 * Returns the completed quadruple.
 */
export function solveProportion(values: Proportion): Proportion {
  const missing = values.filter((value) => value === null).length;
  if (missing !== 1) throw mathError("Leave exactly one value blank");

  const [a, b, c, d] = values;

  if (a === null) {
    if (d === 0) throw mathError("Cannot divide by zero");
    return [((b as number) * (c as number)) / (d as number), b, c, d];
  }
  if (b === null) {
    if (c === 0) throw mathError("Cannot divide by zero");
    return [a, ((a as number) * (d as number)) / (c as number), c, d];
  }
  if (c === null) {
    if (b === 0) throw mathError("Cannot divide by zero");
    return [a, b, ((a as number) * (d as number)) / (b as number), d];
  }
  if (a === 0) throw mathError("Cannot divide by zero");
  return [a, b, c, ((b as number) * (c as number)) / (a as number)];
}

export function formatProportion(values: Proportion): string {
  const [a, b, c, d] = values.map((value) =>
    value === null ? "?" : formatNumber(value),
  );
  return `${a} : ${b} = ${c} : ${d}`;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(10)));
}
