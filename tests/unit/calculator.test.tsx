import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Expression } from "@/components/display/Expression";
import { KEYS, keyById } from "@/lib/keyboard/keymap";
import { resolveKeyAction } from "@/components/calculator/Key";
import { keyboardEventToAction } from "@/lib/keyboard/usePhysicalKeyboard";
import { initialState, reducer } from "@/hooks/useCalculator";
import { lex, numberToken, opToken, symbolToken } from "@/lib/engine";
import type { CalculatorState } from "@/types";

function run(
  actions: Parameters<typeof reducer>[1][],
  from: CalculatorState = initialState,
): CalculatorState {
  return actions.reduce((state, action) => reducer(state, action), from);
}

function typeDigits(digits: string): Parameters<typeof reducer>[1][] {
  return [...digits].map(
    (digit) => ({ type: "insertToken", token: numberToken(digit) }) as const,
  );
}

describe("keymap", () => {
  it("has a unique id for every key", () => {
    const ids = KEYS.map((key) => key.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("lays the keypad out as ten rows of five keys", () => {
    expect(KEYS.length).toBe(50);
  });

  it("gives every key a label and a primary action", () => {
    for (const key of KEYS) {
      expect(key.label.length).toBeGreaterThan(0);
      expect(key.primary).toBeTruthy();
    }
  });

  it("resolves SHIFT and ALPHA variants", () => {
    const sin = keyById("sin")!;
    expect(resolveKeyAction(sin, false, false)).toEqual({
      type: "insertFunction",
      name: "sin",
      args: 1,
    });
    expect(resolveKeyAction(sin, true, false)).toEqual({
      type: "insertFunction",
      name: "asin",
      args: 1,
    });
    expect(resolveKeyAction(sin, false, true)).toEqual({
      type: "insertToken",
      token: { kind: "symbol", name: "D" },
    });
  });

  it("falls back to the primary action when a variant is not defined", () => {
    const seven = keyById("7")!;
    expect(resolveKeyAction(seven, true, true)).toEqual({
      type: "insertToken",
      token: numberToken("7"),
    });
  });
});

describe("reducer", () => {
  it("inserts digits and moves the cursor", () => {
    const state = run(typeDigits("12"));
    expect(state.tokens).toHaveLength(2);
    expect(state.cursor).toBe(2);
  });

  it("deletes the token before the cursor", () => {
    const state = run([
      ...typeDigits("12"),
      { type: "control", control: "delete" },
    ]);
    expect(state.tokens).toHaveLength(1);
    expect(state.cursor).toBe(1);
  });

  it("clears the buffer", () => {
    const state = run([
      ...typeDigits("12"),
      { type: "control", control: "clear" },
    ]);
    expect(state.tokens).toHaveLength(0);
    expect(state.cursor).toBe(0);
  });

  it("evaluates an expression and records history", () => {
    const state = run([
      ...typeDigits("2"),
      { type: "insertToken", token: opToken("+") },
      ...typeDigits("3"),
      { type: "control", control: "equals" },
    ]);
    expect(state.result).toBe("5");
    expect(state.ans).toBe(5);
    expect(state.history).toHaveLength(1);
    expect(state.history[0]!.expression).toBe("2+3");
    expect(state.error).toBeNull();
  });

  it("reports a syntax error for incomplete input", () => {
    const state = run([
      ...typeDigits("2"),
      { type: "insertToken", token: opToken("+") },
      { type: "control", control: "equals" },
    ]);
    expect(state.error).toBe("Syntax Error");
  });

  it("stores and recalls a variable", () => {
    const afterValue = run([
      ...typeDigits("7"),
      { type: "control", control: "equals" },
      { type: "control", control: "sto" },
      { type: "insertToken", token: symbolToken("A") },
    ]);
    expect(afterValue.variables.A).toBe(7);
    expect(afterValue.tokens).toHaveLength(1);

    const recalled = run([
      { type: "control", control: "rcl" },
      { type: "insertToken", token: symbolToken("A") },
    ]);
    expect(recalled.tokens).toEqual([{ kind: "symbol", name: "A" }]);
  });

  it("cycles the angle unit", () => {
    let state = run([{ type: "control", control: "drg" }]);
    expect(state.angleUnit).toBe("RAD");
    state = reducer(state, { type: "control", control: "drg" });
    expect(state.angleUnit).toBe("GRA");
    state = reducer(state, { type: "control", control: "drg" });
    expect(state.angleUnit).toBe("DEG");
  });

  it("clears the buffer when the mode changes", () => {
    const state = run([
      ...typeDigits("12"),
      { type: "setMode", mode: "matrix" },
    ]);
    expect(state.mode).toBe("matrix");
    expect(state.tokens).toHaveLength(0);
  });

  it("inserts a function with the caret inside the parentheses", () => {
    const state = run([
      { type: "insertFunction", name: "sin", args: 1 },
      ...typeDigits("30"),
    ]);
    expect(state.tokens.map((token) => token.kind)).toEqual([
      "func",
      "lparen",
      "number",
      "number",
      "rparen",
    ]);

    const evaluated = reducer(state, { type: "control", control: "equals" });
    expect(evaluated.result).toBe("0.5");
  });

  it("inserts multi-argument functions with comma separators", () => {
    const state = run([{ type: "insertFunction", name: "gcd", args: 2 }]);
    expect(state.tokens.map((token) => token.kind)).toEqual([
      "func",
      "lparen",
      "comma",
      "rparen",
    ]);
    expect(state.cursor).toBe(2);
  });

  it("offers an S⇔D alternate for exact values", () => {
    const state = run([
      ...typeDigits("0"),
      { type: "insertToken", token: numberToken(".") },
      ...typeDigits("5"),
      { type: "control", control: "equals" },
    ]);
    expect(state.result).toBe("0.5");
    expect(state.resultAlternate).toBe("1/2");

    const toggled = reducer(state, { type: "control", control: "sd" });
    expect(toggled.result).toBe("1/2");
    expect(toggled.resultAlternate).toBe("0.5");
  });

  it("replays the previous calculation", () => {
    const first = run([
      ...typeDigits("2"),
      { type: "insertToken", token: opToken("+") },
      ...typeDigits("2"),
      { type: "control", control: "equals" },
    ]);
    const cleared = reducer(first, { type: "control", control: "clear" });
    const replayed = reducer(cleared, { type: "control", control: "up" });
    expect(replayed.tokens).toHaveLength(3);
  });

  it("toggles insert mode and overwrites when it is off", () => {
    const withInsertOff = run([
      ...typeDigits("5"),
      { type: "control", control: "ins" },
      { type: "control", control: "left" },
    ]);
    const overwritten = reducer(withInsertOff, {
      type: "insertToken",
      token: numberToken("9"),
    });
    expect(overwritten.tokens).toEqual([{ kind: "number", text: "9" }]);
  });
});

describe("physical keyboard mapping", () => {
  const base = { ctrlKey: false, metaKey: false, altKey: false };

  it("maps digits and operators", () => {
    expect(keyboardEventToAction({ key: "5", ...base })).toEqual({
      type: "insertToken",
      token: { kind: "number", text: "5" },
    });
    expect(keyboardEventToAction({ key: "*", ...base })).toEqual({
      type: "insertToken",
      token: { kind: "op", op: "*" },
    });
  });

  it("maps control keys", () => {
    expect(keyboardEventToAction({ key: "Enter", ...base })).toEqual({
      type: "control",
      control: "equals",
    });
    expect(keyboardEventToAction({ key: "Backspace", ...base })).toEqual({
      type: "control",
      control: "delete",
    });
    expect(keyboardEventToAction({ key: "Escape", ...base })).toEqual({
      type: "control",
      control: "clear",
    });
    expect(keyboardEventToAction({ key: "ArrowLeft", ...base })).toEqual({
      type: "control",
      control: "left",
    });
    expect(keyboardEventToAction({ key: "ArrowUp", ...base })).toEqual({
      type: "control",
      control: "up",
    });
  });

  it("ignores modified keys so browser shortcuts keep working", () => {
    expect(
      keyboardEventToAction({ key: "5", ...base, ctrlKey: true }),
    ).toBeNull();
    expect(
      keyboardEventToAction({ key: "a", ...base, metaKey: true }),
    ).toBeNull();
  });

  it("ignores unmapped keys such as Tab", () => {
    expect(keyboardEventToAction({ key: "Tab", ...base })).toBeNull();
    expect(keyboardEventToAction({ key: "F5", ...base })).toBeNull();
  });
});

describe("natural display rendering", () => {
  it("renders a division as a stacked fraction", () => {
    const { container } = render(<Expression tokens={lex("1/2")} cursor={0} />);
    expect(container.querySelector(".calc-frac")).not.toBeNull();
  });

  it("renders a power as a superscript", () => {
    const { container } = render(<Expression tokens={lex("2^3")} cursor={0} />);
    expect(container.querySelector(".calc-pow sup")).not.toBeNull();
  });

  it("renders a square root with a radical", () => {
    const { container } = render(<Expression tokens={lex("√9")} cursor={0} />);
    expect(container.querySelector(".calc-radical")).not.toBeNull();
  });

  it("places a caret in the buffer", () => {
    const { container } = render(<Expression tokens={lex("12")} cursor={2} />);
    expect(container.querySelector(".calc-caret")).not.toBeNull();
  });
});
