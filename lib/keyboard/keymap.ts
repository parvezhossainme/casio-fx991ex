import {
  type OperatorToken,
  type PostfixToken,
  type SymbolName,
  type Token,
  numberToken,
  opToken,
  postfixToken,
  rootToken,
  symbolToken,
} from "@/lib/engine";
import type { CalculatorAction, ControlId } from "@/types";

/**
 * Key definitions for the fx-991EX layout.
 *
 * The physical device has two key blocks: the upper five rows are narrower
 * (6 columns) and the lower four rows are wider (5 columns). A 4-way directional pad
 * occupies a 2x2 area at the top of the function block.
 */

export type KeyTone =
  "modifier-shift" | "modifier-alpha" | "function" | "numeric" | "blue";

export type KeyBlock = "function" | "numeric";

export interface KeyDef {
  id: string;
  block: KeyBlock;
  /** 1-based grid position inside the block. */
  row: number;
  col: number;
  /** Primary legend printed on the key cap. */
  label: string;
  /** Tiny grey text under the primary legend. */
  subLabel?: string;
  /** Yellow legend printed above the key (SHIFT). */
  shiftLabel?: string;
  /** Red legend printed above the key (ALPHA). */
  alphaLabel?: string;
  /** Blue legend printed beside the key (Base-N notation). */
  blueLabel?: string;
  tone: KeyTone;
  primary: CalculatorAction;
  shift?: CalculatorAction;
  alpha?: CalculatorAction;
  ariaLabel?: string;
}

type KeyAction = CalculatorAction;

const digit = (d: string): KeyAction => ({
  type: "insertToken",
  token: numberToken(d),
});
const op = (o: OperatorToken): KeyAction => ({
  type: "insertToken",
  token: opToken(o),
});
const sym = (name: SymbolName): KeyAction => ({
  type: "insertToken",
  token: symbolToken(name),
});
const root = (name: "sqrt" | "cbrt"): KeyAction => ({
  type: "insertToken",
  token: rootToken(name),
});
const postfix = (p: PostfixToken): KeyAction => ({
  type: "insertToken",
  token: postfixToken(p),
});
const tokens = (list: Token[]): KeyAction => ({
  type: "insertTokens",
  tokens: list,
});
const call = (name: string, args: number): KeyAction => ({
  type: "insertFunction",
  name,
  args,
});
const ctl = (control: ControlId): KeyAction => ({ type: "control", control });

const square = (): KeyAction => tokens([opToken("^"), numberToken("2")]);
const cube = (): KeyAction => tokens([opToken("^"), numberToken("3")]);
const tenPower = (): KeyAction =>
  tokens([numberToken("1"), numberToken("0"), opToken("^")]);
const ePower = (): KeyAction => tokens([symbolToken("e"), opToken("^")]);

export const FUNCTION_COLUMNS = 6;
export const FUNCTION_ROWS = 5;
export const NUMERIC_COLUMNS = 5;
export const NUMERIC_ROWS = 4;

/** The 4-way replay/directional pad, placed in the function block. */
export const DIRECTIONAL_PAD = {
  row: 1,
  col: 3,
  width: 2,
  height: 2,
  directions: {
    up: ctl("up"),
    down: ctl("down"),
    left: ctl("left"),
    right: ctl("right"),
  } satisfies Record<"up" | "down" | "left" | "right", CalculatorAction>,
};

export const FUNCTION_KEYS: KeyDef[] = [
  // ── Row 1 ──────────────────────────────────────────────────────────────────
  {
    id: "shift",
    block: "function",
    row: 1,
    col: 1,
    label: "SHIFT",
    tone: "modifier-shift",
    primary: { type: "toggleShift" },
    ariaLabel: "Shift",
  },
  {
    id: "alpha",
    block: "function",
    row: 1,
    col: 2,
    label: "ALPHA",
    tone: "modifier-alpha",
    primary: { type: "toggleAlpha" },
    ariaLabel: "Alpha",
  },
  // columns 3-4 are the directional pad
  {
    id: "menu",
    block: "function",
    row: 1,
    col: 5,
    label: "MENU",
    shiftLabel: "SETUP",
    tone: "function",
    primary: ctl("mode"),
    shift: ctl("setup"),
    ariaLabel: "Menu",
  },
  {
    id: "on",
    block: "function",
    row: 1,
    col: 6,
    label: "ON",
    tone: "function",
    primary: ctl("on"),
    ariaLabel: "On",
  },

  // ── Row 2 ──────────────────────────────────────────────────────────────────
  {
    id: "optn",
    block: "function",
    row: 2,
    col: 1,
    label: "OPTN",
    tone: "function",
    primary: ctl("optn"),
    ariaLabel: "Options",
  },
  {
    id: "calc",
    block: "function",
    row: 2,
    col: 2,
    label: "CALC",
    shiftLabel: "SOLVE",
    tone: "function",
    primary: ctl("calc"),
    shift: ctl("solve"),
    ariaLabel: "Calc",
  },
  {
    id: "deriv",
    block: "function",
    row: 2,
    col: 5,
    label: "d/dx",
    tone: "function",
    primary: call("deriv", 2),
    ariaLabel: "Derivative",
  },
  {
    id: "integral",
    block: "function",
    row: 2,
    col: 6,
    label: "∫dx",
    tone: "function",
    primary: call("integ", 3),
    ariaLabel: "Integral",
  },

  // ── Row 3 ──────────────────────────────────────────────────────────────────
  {
    id: "frac",
    block: "function",
    row: 3,
    col: 1,
    label: "a b/c",
    tone: "function",
    primary: op("/"),
    ariaLabel: "Fraction",
  },
  {
    id: "sqrt",
    block: "function",
    row: 3,
    col: 2,
    label: "√",
    shiftLabel: "³√",
    tone: "function",
    primary: root("sqrt"),
    shift: root("cbrt"),
    ariaLabel: "Square root",
  },
  {
    id: "square",
    block: "function",
    row: 3,
    col: 3,
    label: "x²",
    shiftLabel: "x³",
    blueLabel: "DEC",
    tone: "function",
    primary: square(),
    shift: cube(),
    ariaLabel: "Square",
  },
  {
    id: "power",
    block: "function",
    row: 3,
    col: 4,
    label: "xⁿ",
    shiftLabel: "ʸ√x",
    blueLabel: "HEX",
    tone: "function",
    primary: op("^"),
    shift: call("root", 2),
    ariaLabel: "Power",
  },
  {
    id: "log",
    block: "function",
    row: 3,
    col: 5,
    label: "log",
    shiftLabel: "10ˣ",
    blueLabel: "BIN",
    tone: "function",
    primary: call("log", 1),
    shift: tenPower(),
    ariaLabel: "Logarithm",
  },
  {
    id: "ln",
    block: "function",
    row: 3,
    col: 6,
    label: "ln",
    shiftLabel: "eˣ",
    blueLabel: "OCT",
    tone: "function",
    primary: call("ln", 1),
    shift: ePower(),
    ariaLabel: "Natural logarithm",
  },

  // ── Row 4 ──────────────────────────────────────────────────────────────────
  {
    id: "neg",
    block: "function",
    row: 4,
    col: 1,
    label: "(−)",
    alphaLabel: "A",
    tone: "function",
    primary: op("-"),
    alpha: sym("A"),
    ariaLabel: "Negative sign",
  },
  {
    id: "dms",
    block: "function",
    row: 4,
    col: 2,
    label: "°′″",
    alphaLabel: "B",
    tone: "function",
    primary: ctl("dms"),
    alpha: sym("B"),
    ariaLabel: "Degrees minutes seconds",
  },
  {
    id: "recip",
    block: "function",
    row: 4,
    col: 3,
    label: "x⁻¹",
    shiftLabel: "x!",
    alphaLabel: "C",
    tone: "function",
    primary: postfix("^-1"),
    shift: postfix("!"),
    alpha: sym("C"),
    ariaLabel: "Reciprocal",
  },
  {
    id: "sin",
    block: "function",
    row: 4,
    col: 4,
    label: "sin",
    shiftLabel: "sin⁻¹",
    alphaLabel: "D",
    tone: "function",
    primary: call("sin", 1),
    shift: call("asin", 1),
    alpha: sym("D"),
    ariaLabel: "Sine",
  },
  {
    id: "cos",
    block: "function",
    row: 4,
    col: 5,
    label: "cos",
    shiftLabel: "cos⁻¹",
    alphaLabel: "E",
    tone: "function",
    primary: call("cos", 1),
    shift: call("acos", 1),
    alpha: sym("E"),
    ariaLabel: "Cosine",
  },
  {
    id: "tan",
    block: "function",
    row: 4,
    col: 6,
    label: "tan",
    shiftLabel: "tan⁻¹",
    alphaLabel: "F",
    tone: "function",
    primary: call("tan", 1),
    shift: call("atan", 1),
    alpha: sym("F"),
    ariaLabel: "Tangent",
  },

  // ── Row 5 ──────────────────────────────────────────────────────────────────
  {
    id: "sto",
    block: "function",
    row: 5,
    col: 1,
    label: "STO",
    shiftLabel: "RECALL",
    tone: "function",
    primary: ctl("sto"),
    shift: ctl("rcl"),
    ariaLabel: "Store",
  },
  {
    id: "eng",
    block: "function",
    row: 5,
    col: 2,
    label: "ENG",
    alphaLabel: "M",
    tone: "function",
    primary: { type: "setFormat", format: { mode: "eng" } },
    alpha: sym("M"),
    ariaLabel: "Engineering notation",
  },
  {
    id: "lparen",
    block: "function",
    row: 5,
    col: 3,
    label: "(",
    alphaLabel: "Y",
    tone: "function",
    primary: { type: "insertToken", token: { kind: "lparen" } },
    alpha: sym("Y"),
    ariaLabel: "Open parenthesis",
  },
  {
    id: "rparen",
    block: "function",
    row: 5,
    col: 4,
    label: ")",
    tone: "function",
    primary: { type: "insertToken", token: { kind: "rparen" } },
    ariaLabel: "Close parenthesis",
  },
  {
    id: "sd",
    block: "function",
    row: 5,
    col: 5,
    label: "S⇔D",
    tone: "function",
    primary: ctl("sd"),
    ariaLabel: "Standard to decimal",
  },
  {
    id: "xvar",
    block: "function",
    row: 5,
    col: 6,
    label: "x",
    tone: "function",
    primary: sym("X"),
    ariaLabel: "Variable X",
  },
];

export const NUMERIC_KEYS: KeyDef[] = [
  // ── Row 1 ──────────────────────────────────────────────────────────────────
  {
    id: "7",
    block: "numeric",
    row: 1,
    col: 1,
    label: "7",
    shiftLabel: "CONST",
    tone: "numeric",
    primary: digit("7"),
    shift: ctl("const"),
  },
  {
    id: "8",
    block: "numeric",
    row: 1,
    col: 2,
    label: "8",
    shiftLabel: "CONV",
    tone: "numeric",
    primary: digit("8"),
    shift: ctl("conv"),
  },
  {
    id: "9",
    block: "numeric",
    row: 1,
    col: 3,
    label: "9",
    shiftLabel: "RESET",
    tone: "numeric",
    primary: digit("9"),
    shift: ctl("reset"),
  },
  {
    id: "del",
    block: "numeric",
    row: 1,
    col: 4,
    label: "DEL",
    shiftLabel: "INS",
    tone: "blue",
    primary: ctl("delete"),
    shift: ctl("ins"),
    ariaLabel: "Delete",
  },
  {
    id: "ac",
    block: "numeric",
    row: 1,
    col: 5,
    label: "AC",
    shiftLabel: "OFF",
    tone: "blue",
    primary: ctl("clear"),
    shift: ctl("off"),
    ariaLabel: "All clear",
  },

  // ── Row 2 ──────────────────────────────────────────────────────────────────
  {
    id: "4",
    block: "numeric",
    row: 2,
    col: 1,
    label: "4",
    tone: "numeric",
    primary: digit("4"),
  },
  {
    id: "5",
    block: "numeric",
    row: 2,
    col: 2,
    label: "5",
    tone: "numeric",
    primary: digit("5"),
  },
  {
    id: "6",
    block: "numeric",
    row: 2,
    col: 3,
    label: "6",
    tone: "numeric",
    primary: digit("6"),
  },
  {
    id: "mul",
    block: "numeric",
    row: 2,
    col: 4,
    label: "×",
    shiftLabel: "Pol",
    tone: "numeric",
    primary: op("*"),
    shift: call("Pol", 2),
    ariaLabel: "Multiply",
  },
  {
    id: "div",
    block: "numeric",
    row: 2,
    col: 5,
    label: "÷",
    shiftLabel: "Rec",
    tone: "numeric",
    primary: op("/"),
    shift: call("Rec", 2),
    ariaLabel: "Divide",
  },

  // ── Row 3 ──────────────────────────────────────────────────────────────────
  {
    id: "1",
    block: "numeric",
    row: 3,
    col: 1,
    label: "1",
    tone: "numeric",
    primary: digit("1"),
  },
  {
    id: "2",
    block: "numeric",
    row: 3,
    col: 2,
    label: "2",
    tone: "numeric",
    primary: digit("2"),
  },
  {
    id: "3",
    block: "numeric",
    row: 3,
    col: 3,
    label: "3",
    tone: "numeric",
    primary: digit("3"),
  },
  {
    id: "add",
    block: "numeric",
    row: 3,
    col: 4,
    label: "+",
    shiftLabel: "nPr",
    tone: "numeric",
    primary: op("+"),
    shift: call("nPr", 2),
    ariaLabel: "Add",
  },
  {
    id: "sub",
    block: "numeric",
    row: 3,
    col: 5,
    label: "−",
    shiftLabel: "nCr",
    tone: "numeric",
    primary: op("-"),
    shift: call("nCr", 2),
    ariaLabel: "Subtract",
  },

  // ── Row 4 ──────────────────────────────────────────────────────────────────
  {
    id: "0",
    block: "numeric",
    row: 4,
    col: 1,
    label: "0",
    shiftLabel: "Rnd",
    tone: "numeric",
    primary: digit("0"),
    shift: call("round", 1),
  },
  {
    id: "dot",
    block: "numeric",
    row: 4,
    col: 2,
    label: ".",
    shiftLabel: "Ran#",
    alphaLabel: "RanInt",
    tone: "numeric",
    primary: digit("."),
    shift: call("Ran", 0),
    alpha: call("RanInt", 2),
    ariaLabel: "Decimal point",
  },
  {
    id: "exp",
    block: "numeric",
    row: 4,
    col: 3,
    label: "×10ˣ",
    shiftLabel: "π",
    alphaLabel: "e",
    tone: "numeric",
    primary: op("E"),
    shift: sym("pi"),
    alpha: sym("e"),
    ariaLabel: "Times ten to the power",
  },
  {
    id: "ans",
    block: "numeric",
    row: 4,
    col: 4,
    label: "Ans",
    shiftLabel: "%",
    tone: "numeric",
    primary: sym("Ans"),
    shift: postfix("%"),
    ariaLabel: "Answer",
  },
  {
    id: "equals",
    block: "numeric",
    row: 4,
    col: 5,
    label: "=",
    shiftLabel: "≈",
    tone: "numeric",
    primary: ctl("equals"),
    shift: ctl("sd"),
    ariaLabel: "Equals",
  },
];

export const KEYS: KeyDef[] = [...FUNCTION_KEYS, ...NUMERIC_KEYS];

/** Look up a key by id (used by tests and the physical keyboard mapping). */
export function keyById(id: string): KeyDef | undefined {
  return KEYS.find((key) => key.id === id);
}
