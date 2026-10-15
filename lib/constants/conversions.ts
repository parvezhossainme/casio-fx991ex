import { argumentError } from "@/lib/engine";

/** Unit conversion data used by the CONV tool (SHIFT + 8). */

export interface Unit {
  id: string;
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export interface ConversionCategory {
  id: string;
  label: string;
  units: Unit[];
}

const linear = (factor: number): Pick<Unit, "toBase" | "fromBase"> => ({
  toBase: (value) => value * factor,
  fromBase: (value) => value / factor,
});

const unit = (id: string, label: string, factor: number): Unit => ({
  id,
  label,
  ...linear(factor),
});

export const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: "length",
    label: "Length",
    units: [
      unit("mm", "mm", 0.001),
      unit("cm", "cm", 0.01),
      unit("m", "m", 1),
      unit("km", "km", 1000),
      unit("in", "in", 0.0254),
      unit("ft", "ft", 0.3048),
      unit("yd", "yd", 0.9144),
      unit("mile", "mile", 1609.344),
      unit("nmi", "nmi", 1852),
    ],
  },
  {
    id: "mass",
    label: "Mass",
    units: [
      unit("mg", "mg", 1e-6),
      unit("g", "g", 0.001),
      unit("kg", "kg", 1),
      unit("t", "t", 1000),
      unit("oz", "oz", 0.028349523125),
      unit("lb", "lb", 0.45359237),
    ],
  },
  {
    id: "area",
    label: "Area",
    units: [
      unit("cm2", "cm²", 1e-4),
      unit("m2", "m²", 1),
      unit("km2", "km²", 1e6),
      unit("ha", "ha", 1e4),
      unit("acre", "acre", 4046.8564224),
      unit("ft2", "ft²", 0.09290304),
    ],
  },
  {
    id: "volume",
    label: "Volume",
    units: [
      unit("ml", "mL", 1e-6),
      unit("l", "L", 0.001),
      unit("m3", "m³", 1),
      unit("galus", "gal (US)", 0.003785411784),
      unit("galuk", "gal (UK)", 0.00454609),
      unit("ft3", "ft³", 0.028316846592),
    ],
  },
  {
    id: "speed",
    label: "Speed",
    units: [
      unit("mps", "m/s", 1),
      unit("kph", "km/h", 1 / 3.6),
      unit("mph", "mph", 0.44704),
      unit("knot", "knot", 0.514444444),
      unit("fps", "ft/s", 0.3048),
    ],
  },
  {
    id: "time",
    label: "Time",
    units: [
      unit("s", "s", 1),
      unit("min", "min", 60),
      unit("h", "h", 3600),
      unit("day", "day", 86400),
      unit("week", "week", 604800),
    ],
  },
  {
    id: "energy",
    label: "Energy",
    units: [
      unit("j", "J", 1),
      unit("kj", "kJ", 1000),
      unit("cal", "cal", 4.184),
      unit("kcal", "kcal", 4184),
      unit("wh", "Wh", 3600),
      unit("kwh", "kWh", 3.6e6),
      unit("btu", "BTU", 1055.05585262),
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    units: [
      unit("pa", "Pa", 1),
      unit("kpa", "kPa", 1000),
      unit("bar", "bar", 100000),
      unit("atm", "atm", 101325),
      unit("mmhg", "mmHg", 133.322387415),
      unit("psi", "psi", 6894.757293168),
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      {
        id: "c",
        label: "°C",
        toBase: (v) => v + 273.15,
        fromBase: (v) => v - 273.15,
      },
      {
        id: "f",
        label: "°F",
        toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
        fromBase: (v) => ((v - 273.15) * 9) / 5 + 32,
      },
      { id: "k", label: "K", toBase: (v) => v, fromBase: (v) => v },
    ],
  },
];

export function findCategory(id: string): ConversionCategory | undefined {
  return CONVERSION_CATEGORIES.find((category) => category.id === id);
}

/** Convert `value` from one unit to another within the same category. */
export function convertUnits(
  value: number,
  categoryId: string,
  fromId: string,
  toId: string,
): number {
  const category = findCategory(categoryId);
  if (!category) throw argumentError("Unknown conversion category");
  const from = category.units.find((entry) => entry.id === fromId);
  const to = category.units.find((entry) => entry.id === toId);
  if (!from || !to) throw argumentError("Unknown unit");
  return to.fromBase(from.toBase(value));
}
