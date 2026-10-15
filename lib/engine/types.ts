/** Shared engine-level types. */

export type AngleUnit = "DEG" | "RAD" | "GRA";

/** Radians per one unit of the given angle unit. */
export function radiansPerUnit(unit: AngleUnit): number {
  switch (unit) {
    case "DEG":
      return Math.PI / 180;
    case "GRA":
      return Math.PI / 200;
    case "RAD":
      return 1;
  }
}

export function convertAngle(
  value: number,
  from: AngleUnit,
  to: AngleUnit,
): number {
  return (value * radiansPerUnit(from)) / radiansPerUnit(to);
}

export type NumberBase = 2 | 8 | 10 | 16;

export const BASE_LABEL: Record<NumberBase, string> = {
  2: "BIN",
  8: "OCT",
  10: "DEC",
  16: "HEX",
};
