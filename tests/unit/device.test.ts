import { describe, expect, it } from "vitest";
import {
  evaluateTokens,
  numberToTokens,
  toDegreesMinutesSeconds,
  type Token,
} from "@/lib/engine";
import { PHYSICAL_CONSTANTS } from "@/lib/constants/physical";
import {
  CONVERSION_CATEGORIES,
  convertUnits,
} from "@/lib/constants/conversions";
import { initialState, reducer } from "@/hooks/useCalculator";
import type { CalculatorAction, CalculatorState } from "@/types";

function run(
  actions: CalculatorAction[],
  from: CalculatorState = initialState,
): CalculatorState {
  return actions.reduce((state, action) => reducer(state, action), from);
}

function typeDigits(text: string): CalculatorAction[] {
  return [...text].map((char) =>
    char === "."
      ? ({ type: "insertToken", token: { kind: "number", text: "." } } as const)
      : ({
          type: "insertToken",
          token: { kind: "number", text: char },
        } as const),
  );
}

describe("numberToTokens", () => {
  const evaluate = (tokens: Token[]): number => {
    const value = evaluateTokens(tokens, { angleUnit: "RAD" });
    if (typeof value !== "number") throw new Error("expected a number");
    return value;
  };

  it("round-trips integers through the token model", () => {
    expect(evaluate(numberToTokens(299792458))).toBe(299792458);
    expect(evaluate(numberToTokens(7))).toBe(7);
  });

  it("round-trips decimals", () => {
    expect(evaluate(numberToTokens(1.5))).toBeCloseTo(1.5, 12);
    expect(evaluate(numberToTokens(-0.25))).toBeCloseTo(-0.25, 12);
  });

  it("uses the ×10ˣ operator for extreme magnitudes", () => {
    expect(evaluate(numberToTokens(6.626e-34))).toBeCloseTo(6.626e-34, 40);
    expect(evaluate(numberToTokens(1e12))).toBeCloseTo(1e12, 0);
  });

  it("returns no tokens for non-finite input", () => {
    expect(numberToTokens(Number.NaN)).toEqual([]);
    expect(numberToTokens(Number.POSITIVE_INFINITY)).toEqual([]);
  });
});

describe("degrees / minutes / seconds", () => {
  it("converts a decimal angle", () => {
    expect(toDegreesMinutesSeconds(1.5)).toBe("1°30′0″");
    expect(toDegreesMinutesSeconds(2.25)).toBe("2°15′0″");
  });

  it("keeps the sign", () => {
    expect(toDegreesMinutesSeconds(-0.25)).toBe("-0°15′0″");
  });

  it("carries seconds that round up to a minute", () => {
    expect(toDegreesMinutesSeconds(1 + 59.9999999 / 3600)).toBe("1°1′0″");
    expect(toDegreesMinutesSeconds(1.9999999999)).toBe("2°0′0″");
  });
});

describe("physical constants", () => {
  it("contains the defining constant values exactly", () => {
    const speedOfLight = PHYSICAL_CONSTANTS.find((entry) => entry.id === "c");
    expect(speedOfLight?.value).toBe(299792458);

    const planck = PHYSICAL_CONSTANTS.find((entry) => entry.id === "h");
    expect(planck?.value).toBe(6.62607015e-34);

    const gravity = PHYSICAL_CONSTANTS.find((entry) => entry.id === "g");
    expect(gravity?.value).toBe(9.80665);
  });

  it("gives every constant a symbol, label and unit", () => {
    for (const constant of PHYSICAL_CONSTANTS) {
      expect(constant.symbol.length).toBeGreaterThan(0);
      expect(constant.label.length).toBeGreaterThan(0);
      expect(constant.unit.length).toBeGreaterThan(0);
      expect(Number.isFinite(constant.value)).toBe(true);
    }
  });
});

describe("unit conversion", () => {
  it("converts within a category", () => {
    expect(convertUnits(1, "length", "km", "m")).toBeCloseTo(1000, 9);
    expect(convertUnits(1, "length", "mile", "in")).toBeCloseTo(63360, 6);
    expect(convertUnits(1, "mass", "kg", "g")).toBeCloseTo(1000, 9);
  });

  it("converts temperature with offsets", () => {
    expect(convertUnits(100, "temperature", "c", "f")).toBeCloseTo(212, 9);
    expect(convertUnits(32, "temperature", "f", "c")).toBeCloseTo(0, 9);
    expect(convertUnits(0, "temperature", "c", "k")).toBeCloseTo(273.15, 9);
  });

  it("offers at least two units in every category", () => {
    for (const category of CONVERSION_CATEGORIES) {
      expect(category.units.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("device controls", () => {
  it("accumulates the answer into memory with M+", () => {
    const state = run([
      ...typeDigits("4"),
      { type: "control", control: "equals" },
      { type: "control", control: "mplus" },
      { type: "control", control: "clear" },
      ...typeDigits("6"),
      { type: "control", control: "equals" },
      { type: "control", control: "mplus" },
    ]);
    expect(state.variables.M).toBe(10);
  });

  it("renders the answer as degrees/minutes/seconds", () => {
    const state = run([
      ...typeDigits("1.5"),
      { type: "control", control: "equals" },
      { type: "control", control: "dms" },
    ]);
    expect(state.result).toBe("1°30′0″");
  });

  it("resets variables, history and preferences", () => {
    const dirty = run([
      ...typeDigits("9"),
      { type: "control", control: "equals" },
      { type: "control", control: "sto" },
      { type: "insertToken", token: { kind: "symbol", name: "A" } },
      { type: "setAngleUnit", unit: "GRA" },
    ]);
    expect(dirty.variables.A).toBe(9);
    expect(dirty.history.length).toBeGreaterThan(0);

    const reset = reducer(dirty, { type: "control", control: "reset" });
    expect(reset.variables).toEqual({});
    expect(reset.history).toEqual([]);
    expect(reset.angleUnit).toBe("DEG");
    expect(reset.ans).toBe(0);
  });

  it("toggles engineering notation from the ENG key", () => {
    const state = run([
      { type: "setFormat", format: { mode: "eng" } },
      ...typeDigits("12345"),
      { type: "control", control: "equals" },
    ]);
    expect(state.result).toBe("12.345×10³");
  });
});
